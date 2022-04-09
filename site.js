let ctri = {

    disabledTextColor: '#6c757d',
    order: 'asc',
    defaultLinkText: "Full Text",
    data: [],
    table: null,
    dataLink: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT6OITFMbQ5y4dDwRdcPZCoMY6Kp2lGyBZb8kS8hKVCyIq6ItYBXQR-rUByrClzUwEFum7FPCd-L0ya/pub?gid=1937609001&single=true&output=csv',
    
    dataCols: [
        {
            title: "display",
            data: "display",
            className: "dataTablesDisplayCol",
            render: (data, type, row, meta) => {
                return type === 'filter' ? jQuery(data).text() : data;
            },
            visible: true
        },
        {
            title: "Article Title",
            data: "title",
            visible: false
        },
        {
            title: "Journal",
            data: "journal",
            visible: false
        },
        {
            title: "Topic",
            data: "topic",
            visible: false
        },
        {
            title: "Primary Author",
            data: "author",
            render: (data, type, row, meta) => {
                return typeof data[0] == "string" ? data[0] : data[0][2];
            },
            visible: false
        },
        {
            title: "Year",
            data: "date_of_publication",
            render: (data, type, row, meta) => {
                return data.split('-')[0];
            },
            visible: false
        }
    ],
    
    loadData: async () => {
        fetch(ctri.dataLink).then(response => {
            return response.text();
        }).then(csv => {
            ctri.data = ctri.csv2json(csv);
            ctri.refresh();
        });
    },
    
    csv2json: (csvString) => {
        let json = [];
        let csvArray = csvString.split("\n");
        
        // Remove the column names from csvArray into csvColumns.
        let csvColumns = csvArray.shift().split(',');
        
        csvArray.forEach( (rowString) => {
			// Regex split the string to ignore commas in quotes
            let csvRow = rowString.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);

            // Here we work on a single row.
            // Create an object with all of the csvColumns as keys.
            let row = new Object();
            for ( let colNum = 0; colNum < csvRow.length; colNum++) {
                // Remove beginning and ending quotes since stringify will add them.
                let colData = csvRow[colNum].replace(/^['"]|['"]$/g, "");
                row[csvColumns[colNum]] = colData;
            }
            
            // Special check for our data format
            let author = [row['first_name'],row['middle_name'],row['last_name']];
            if (row['title'] != "") {
                row['author'] = [author];
                json.push(row);
            } else {
                json[json.length-1].author.push(author);
            }
        });

        return json;
    },
    
    refresh: () => {
        try {
            ctri.table.clear();
            ctri.table.rows.add(ctri.generateTableStruct());
            ctri.table.draw();
        } catch(e) {
            console.log(e);
            setTimeout(ctri.refresh, 200);
        }
    },

    init: () => {
        
        // Grab data from google sheets, refreshes data when done
        ctri.loadData();
        
        // Setup Table
        jQuery('#mainDataTable').DataTable({
            columns: ctri.dataCols,
            data: ctri.generateTableStruct(),
            createdRow: (row,data,index) => jQuery(row).addClass('dataTablesRow'),
            sDom: 'ftpi',
            drawCallback: () => {
                if ( !jQuery(".expandButton").length ) {
                    jQuery(".dataTablesRow").append(ctri.generateExpandButton());
                }
                jQuery(window).trigger("resize");
            },
            language: {
                "zeroRecords": "No matching journal entries",
                "search": ""
            }
        });
        ctri.table = jQuery('#mainDataTable').DataTable();
        
        // Set place holder on search 
        jQuery("input.form-control").prop('placeholder','Search journal entries');
        
        // Setup expand buttons
        jQuery('#mainDataTable tbody').on('click', '.expandButton', (e) => {
            let $tr = jQuery(e.currentTarget).parent();
            let row = ctri.table.row($tr);
            if (row.child.isShown()) {
                row.child.hide();
                $tr.removeClass('shown');
            } else {
                row.child( ctri.generateHTMLforChild(row.data()), 'dataTableChild').show();
                $tr.addClass('shown');
            }
        });
        
        // On resize we need to be sure the expand buttons don't drift
        jQuery(window).on('resize', () => {
            jQuery(".dataTablesRow").each( function() {
                jQuery(this).find(".expandButton").css('transform',`translate(-40px,${jQuery(this).height()-33}px)`)
            });
        }).trigger("resize");
        
        // Insert sort drop down
        jQuery("#mainDataTable_filter").after(ctri.generateSortDropDown);
        jQuery(".dataTablesCustom_sort").on('change', ctri.sort).trigger("change");
        jQuery(".dataTablesCustom_order").on('click', ctri.orderToggle);
    },
    
    sort: (e) => {
        let selection = jQuery(".dataTablesCustom_sort").val();
        jQuery(".dataTablesCustom_sort").css('color', selection ? 'black' : ctri.disabledTextColor );
        let index = ctri.dataCols.map(x => x.data).indexOf( jQuery(e.currentTarget).val() );
        let table = jQuery('#mainDataTable').DataTable();
        ctri.table.order( [ index > -1 ? index : 0, 'asc' ] ).draw();
    },
    
    orderToggle: () => {
        ctri.order = ctri.order == "asc" ? "desc" : "asc";
        let table = jQuery('#mainDataTable').DataTable();
        ctri.table.order( [ ctri.table.order()[0][0], ctri.order ] ).draw();
        jQuery(".dataTablesCustom_order i").removeClass('fa-sort-amount-down fa-sort-amount-up')
        jQuery(".dataTablesCustom_order i").addClass('fa-sort-amount-' + (ctri.order == "asc" ? 'down' : 'up'))
    },
    
    generateTableStruct: () => {
        let data = [];
        ctri.data.forEach( (el) => {
            let authors = [];
            el.author.forEach( (el) => {
                authors.push(typeof el == "string" ? el : ((el[2]||"").trim()+" "+(el[0][0]||"").trim()+(el[1][0]||"").trim()).trim());
            });
            authors = authors.filter(n=>n);
            let link = el.link ? `<a href="${el.url}">[${el.url_text||ctri.defaultLinkText}]</a>` : "";
            data.push(jQuery.extend({
                'display': `
                    <div class="container">
                      <div class="row">
                        <div class="col-9">
                          <div class="container">
                            <div class="row row-title">
                              <div class="col-12">
                                  ${el.title}
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-12">
                                  ${el.journal}
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-12">
                                  ${authors.join(', ')}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-3 text-end mt-1">
                            ${link}
                        </div>
                      </div>
                    </div>
                `
            }, el));
        });
        return data;
    },

    generateHTMLforChild: (data) => {
        let authors = [];
        data.author.forEach( (el) => {
            authors.push(typeof el == "string" ? el : ((el[2]||"").trim()+" "+(el[0][0]||"").trim()+(el[1][0]||"").trim()).trim());
        });
        authors = authors.filter(n=>n);
        let date = "";
        let year = "";
        if( data.date_of_publication ) {
            let [m,d,y] = data.date_of_publication.split('/');
            year = y;
            let tmp = new Date(`${y}-${m}-${d}`);
            date = tmp.toLocaleString('default', { year:'numeric', month: 'long', day:"numeric" });
            date = m == "1" && d == "1" ? "" : date;
        }        
        year = year ? `(${year})` : "";
        let journal = data.journal ? ` ${data.journal}. ` : "";
        let volume = data.volume ? `Vol. ${data.volume}, ` : "";
        let page = data.page ? `: ${data.page}.` : ".";
        let issue = data.issue ? `No. ${data.issue}` : "";
        let topic = data.topic ? `${data.topic}. ` : "";
        let apa = ""
        if ( journal ) {
            apa = `${authors.join(', ')} ${year} ${data.title}.${journal}${volume}${issue}${page}`;
        } else {
            // Non Journal, online should have full date
            apa = `${authors.join(', ')}.${data.title}.${topic}Online ${date}.`;
        }
        apa = apa.trim().replaceAll("  "," ").replaceAll(". .",".").replaceAll(", .",".");
        
        return `
        <b>Authors:</b> ${authors.join(', ')}<br>
        <b>Paper Title:</b> ${data.title}<br>
        <b>Topic:</b> ${data.topic}<br>
        <b>Journal:</b> ${data.journal||"N/A"}<br>
        <b>Volume:</b> ${data.volume||"N/A"}<br>
        <b>Issue:</b> ${data.issue||"N/A"}<br>
        <b>Pages:</b> ${data.page||"N/A"}<br>
        <b>APA:</b><br>
        ${apa}
        `;
    },
    
    generateExpandButton: () => {
        return '<div class="expandButton">+</div>'
    },
    
    generateSortDropDown: () => {
        let html = "<option value=''>Sort by...</option>";
        ctri.dataCols.forEach( (el) => {
            if ( !el.visible ) {
                html = `${html}<option value="${el.data}">${el.title}</option>`;
            }
        });
        return `
            <a class="dataTablesCustom_order">
                <i class="fas fa-sort-amount-down fa-fw"></i>
            </a>
            <select class="dataTablesCustom_sort">${html}</select>`;
    }
};
jQuery(document).ready(ctri.init);
