#include <emscripten/emscripten.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>

void cback(char* data, int size, void* arg) {
    if (size==1) printf("%c", *data);
}

static char* lua;
static char* input;
static char* query_file;
static int update = 1;

void schedule_run() {
  update = 1;
}

int fsize(char* path);
int fsize(char* path) {
    FILE *fp = fopen(path, "r");
    int prev=ftell(fp);
    fseek(fp, 0L, SEEK_END);
    int sz=ftell(fp);
    fseek(fp,prev,SEEK_SET);
    fclose(fp);
    return sz;
}

char* cpy(char* path, char* pos);
char* cpy(char* path, char* pos) {
    int c;
    FILE *file;
    file = fopen(path, "r");
    if (file) {
        while ((c = getc(file)) != EOF)
            *pos++ = (char) c;
        fclose(file);
    } else {
        fprintf(stderr, "cannot read");
    }
    return pos;
}

static worker_handle worker;

void loop(void);
void loop() {
    if (!update) {
        return;
    }
    update = 0;

    int s1,s2,s3;
    int siz = (s1=fsize(lua)) + (s2=fsize(input)) + (s3=fsize(query_file)) + 3*4; // 3 times 4 bytes for lengths
    char* buf = (char*) malloc((unsigned int) siz);
    char* ptr = buf;
    memcpy(ptr,&s1,4);
    memcpy(ptr+4,&s2,4);
    memcpy(ptr+8,&s3,4);
    ptr += 12;

    ptr = cpy(lua,ptr);
    ptr = cpy(input,ptr);
    ptr = cpy(query_file,ptr);

    emscripten_call_worker(worker, "johnmandog", buf, siz, cback, (void*) 42);

    free(buf);
}

int main(int argc, char** argv) {
    //printf("Main func. argc=%d\n", argc);
    //printf("%s %s %s\n", argv[1], argv[2], argv[3]);

    lua = argv[1];
    input = argv[2];
    query_file = argv[3];

    worker = emscripten_create_worker("datalog.js");

    emscripten_set_main_loop(loop, /*fps*/ 1, true);

    return 0;
}
