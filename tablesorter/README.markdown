tablesorter is a jQuery plugin for turning a standard HTML table with THEAD and TBODY tags into a sortable table without page refreshes.
tablesorter can successfully parse and sort many types of data including linked data in a cell.

### Documentation

* See the [full documentation](http://mottie.github.com/tablesorter/docs/).
* All of the [original document pages](http://tablesorter.com/docs/) have been included.
* Information from my blog post on [undocumented options](http://wowmotty.blogspot.com/2011/06/jquery-tablesorter-missing-docs.html) and lots of new demos have also been included.
* Change log moved from included text file into the [wiki documentation](https://github.com/Mottie/tablesorter/wiki/Change).

### Demos

* [Basic alpha-numeric sort Demo](http://mottie.github.com/tablesorter/).
* Links to demo pages can be found within the main [documentation](http://mottie.github.com/tablesorter/docs/).
* More demos & playgrounds - updated in the [wiki pages](https://github.com/Mottie/tablesorter/wiki).

### Features

* Multi-column sorting.
* Multi-tbody sorting - see the [options](http://mottie.github.com/tablesorter/docs/index.html#options) table on the main document page.
* Parsers for sorting text, alphanumeric text, URIs, integers, currency, floats, IP addresses, dates (ISO, long and short formats) &amp; time. [Add your own easily](http://mottie.github.com/tablesorter/docs/example-parsers.html).
* Support for ROWSPAN and COLSPAN on TH elements.
* Support secondary "hidden" sorting (e.g., maintain alphabetical sort when sorting on other criteria).
* Extensibility via [widget system](http://mottie.github.com/tablesorter/docs/example-widgets.html).
* Cross-browser: IE 6.0+, FF 2+, Safari 2.0+, Opera 9.0+.
* Small code size.
* Works with jQuery 1.2.6+.

### Licensing

* Copyright (c) 2007 Christian Bach.
* Original examples and docs at: [http://tablesorter.com](http://tablesorter.com).
* Dual licensed under the [MIT](http://www.opensource.org/licenses/mit-license.php) and [GPL](http://www.gnu.org/licenses/gpl.html) licenses.

### Change Log

View the [complete listing here](https://github.com/Mottie/tablesorter/wiki/Change).

#### Version 2.3.11 (7/12/2012)

* Merged in [mmeisel](https://github.com/mmeisel)'s `ipAddress` parser fix. Optimized the format code.
* Merged in two fixes from [wwalser](https://github.com/wwalser). Thanks for finding and fixes this issue!
* Made the sort functions public. This is in anticipation of using the natural sort function in the filter widget to sort select options.

#### Version 2.3.10 (6/21/2012)

* Fixed the filter widget causing an error when initialized on an empty table. Fixes [issue #95](https://github.com/Mottie/tablesorter/issues/95). Thanks to [Raigen](https://github.com/Raigen) for all of the diligent testing!

#### Version 2.3.9 (6/21/2012)

* Theme updates:
  * Modified the blue & green themes to make the column colors better match the header.
  * Added row hovered styling.
  * Added a `theme.less` file which is set up to allow you to set a one color to create a palette of colors for even and odd rows, columns widget styling and row hovered colors.
* Modified `update`, `updateCell` and `addRows` methods:
  * An `updateComplete` event is now fired after each method has completed.
  * Added a callback to each method. Used as follows:

    ```javascript
    var resort = true, // resort table using the current sort
        callback = function(table){
            alert('new sort applied');
        };
    $("table").trigger("update", [resort, callback]);
    ```

* Added a callback to the `sorton` method. It is used as follows:

    ```javascript
    var sort = [[0,0],[2,0]],
        callback = function(table){
            alert('new sort applied to ' + table.id);
        };
    // Note that the sort value below is inside of another array (inside another set of square brackets) 
    // A callback method was added in 2.3.9. 
    $("table").trigger("sorton", [sort, callback]);
    ```

* Fixed isDigit function returning true on an empty string. Fix for [issue #88](https://github.com/Mottie/tablesorter/issues/88).
* Fixed filter widget:
  * Filter inputs in multiple thead rows now correctly correspond to the column.
  * Fixed filtering of child rows to use the `filter_ignoreCase` option.
  * Fixed child rows displaying incorrectly when not filtered. Fix for [issue #89](https://github.com/Mottie/tablesorter/issues/89).
  * The default filter select will now properly update after an update event. Fix for [issue #91](https://github.com/Mottie/tablesorter/issues/91).
* Fixed `sortList` to prevent errors. Fix for [issue #92](https://github.com/Mottie/tablesorter/issues/92).
* Fixed `onRenderHeader` option missing the last column. Fix for [issue #93](https://github.com/Mottie/tablesorter/issues/93), and thanks to [OBCENEIKON](https://github.com/OBCENEIKON) for the fix!

#### Version 2.3.8 (6/5/2012)

* Filter widget search will now update on table updates. Fix for [issue #86](https://github.com/Mottie/tablesorter/issues/86).
* Fixed errors when entering invalid regex into the filter widget search input. Fix for [issue #87](https://github.com/Mottie/tablesorter/issues/87).
* Removed unnecessary semi-colons from the unicode characters in the [sorting accented characters demo](http://mottie.github.com/tablesorter/docs/example-locale-sort.html).
* Added a [Language](https://github.com/Mottie/tablesorter/wiki/Language) wiki page which contains the character equivalent code for different languages (well only for Polish so far).

#### Version 2.3.7 (6/3/2012)

* Updated `$.tablesorter.replaceAccents()` function to be independent of the table.
  * It was originally table dependent to allow making tables with different languages. I'll have to add another table option to allow this, if the need arises.
  * Modified as suggested in [issue #81](https://github.com/Mottie/tablesorter/issues/81).
* Fixed the `url` parser `is` function to properly detect complete urls.
* Fixed an issue with the `updateCell` method incorrectly targeting the cell when there was more than one row in the header. Fix for [issue #83](https://github.com/Mottie/tablesorter/issues/83).

#### Version 2.3.6 (6/1/2012)

* Made the following enhancements to the filter widget:
  * Include placeholder text in the filter input boxes by adding `data-placeholder` with the text to the header cell; e.g. `data-placeholder="First Name"`. See the examples in the [filter widget demo](http://mottie.github.com/tablesorter/docs/example-widget-filter.html).
  * Exact match added. Add a quote (single or double) to the end of the string to find an exact match. In the first column enter `Clark"` to only find "Clark" and not "Brandon Clark".
  * Wild cards added:
     * `?` (question mark) finds any single non-space character.<br>In the discount column, adding `1?%` in the filter will find all percentages between "10%" and "19%". In the last column, `J?n` will find "Jun" and "Jan".
     * `*` (asterisk) finds multiple non-space characters.<br>In the first column below Enter `Br*` will find multiple names starting with "Br". Now add a space at the end, and "Bruce" will not be included in the results.
  * Regex added. Search columns using regex. For example enter `/20[^0]\d/` in the last column to find all date greater than 2009.
  * Added `filter_functions` option which allows you to add a select dropdown to the specified column that either gathers the options from the column contents or obtains options from custom function settings. Additionally, you can use this option to apply a custom filter function to the column. For more details, see the new [custom filter widget demo](http://mottie.github.com/tablesorter/docs/example-widget-filter-custom.html).

#### Version 2.3.5 (5/28/2012)

* Fixed colspan in header causing javascript errors and metadata issues. Fix for [issue #78](https://github.com/Mottie/tablesorter/issues/78).
* Fixed Chrome "Uncaught RangeError" issue. Fix for [issue #70](https://github.com/Mottie/tablesorter/issues/70).
* Added more optimizations to speed up IE (except IE7):
  * Hide tbody during manipulation - added "tablesorter-hidden" css definition.
  * Parsing of the table contents using `textContent` for modern browsers (including IE9); see [this jsperf](http://jsperf.com/read-innerhtml-vs-innertext-vs-nodevalue-vs-textcontent).
  * Columns widget.
  * Filter widget.
  * Zebra widget.
* Updated the shortDate detection regex to look for two or four grouped digits instead of two through four digits. Fix for [issue #76](https://github.com/Mottie/tablesorter/issues/76).
* Widget updates:
  * Added `initWidgets` option
     * If `true`, all selected widgets (from the `widgets` option) will be applied after the table has initialized.
     * when `false`, selected widgets `init` function will be called, but not the `format` function. So none of the widget formating will be applied to the table. Note: almost all included widgets do not use the `init` function to keep backward compatibility, except for the `saveSort` widget in which the `init` function immediately calls the `format` function. This information is only important if you are writing a custom widget.
     * It would be useful to set this option to false if using the pager plugin along with a very large table, say 1000+ rows. The table will be initialized, but no widgets are applied. Then the pager plugin is called and the table is modified and all of the widgets are applied when completed. So essentially this saves time by only running the widgets once.
     * Modified the pager plugin to make sure it doesn't apply widgets more than once.
  * Added filter widget option `filter_ignoreCase`:
     * The default setting is `true` and all searches will be case insensitive.
     * Set this option to `false` to make the searches case sensitive.
  * Added filter widget option `filter_searchDelay`:
     * Default set to 300 milliseconds.
     * This is the delay before the filter widget starts searching.
     * This option prevents searching for every character while typing and should make searching large tables faster.
  * Resizable widget will no longer initialize a sort after releasing the mouse.
  * Updated ui theme css to remove bold fonts from odd rows.
