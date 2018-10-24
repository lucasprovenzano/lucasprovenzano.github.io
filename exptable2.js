function ExportToTable() {  
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xlsx)$/;  
    /*Checks whether the file is a valid excel file*/  
    if ((regex.test($("#excelfile").val().toLowerCase())) && ($("#excelfile").val().toLowerCase().indexOf(".xlsx") > 0)) {  
        var xlsxflag = true; /*Flag for checking whether excel is .xls format or .xlsx format*/  
        /*Checks whether the browser supports HTML5*/  
        if (typeof (FileReader) != "undefined") {  
            var reader = new FileReader();  
            reader.onload = function (e) {  
                var data = e.target.result;  
                /*Converts the excel data in to object*/  
                if (xlsxflag) {  
                    var workbook = XLSX.read(data, { type: 'buffer' });  
                }  
                /*Gets all the sheetnames of excel in to a variable*/  
                var sheet_name_list = workbook.SheetNames;  
                if (sheet_name_list.length == 1){
                    sheet_name_list.forEach(function (y) { /*Iterate through all sheets*/  
                        /*Convert the cell value to Json*/  
                        if (xlsxflag) {  
                        var exceljson = XLSX.utils.sheet_to_json(workbook.Sheets[1]);  
                        }    
                        if (exceljson.length > 0 ) {  
                        BindTable(exceljson, '#exceltable');  
                        cnt++;  
                        }  
                    });  
                    $('#exceltable').show();  
                }
                else{
                    alert("Please upload a valid Excel file!");  
                }  
            } 
            if (xlsxflag) {/*If excel file is .xlsx extension than creates a Array Buffer from excel*/  
                reader.readAsArrayBuffer($("#excelfile")[0].files[0]);  
            }  
        }
        else {
            alert("Sorry! Your browser does not support HTML5!");
        } 
    }   
    else {  
        alert("Please upload a valid Excel file!");  
    }  
 }  

 function BindTable(jsondata, tableid) {/*Function used to convert the JSON array to Html Table*/  
     var columns = BindTableHeader(jsondata, tableid); /*Gets all the column headings of Excel*/  
     for (var i = 0; i < jsondata.length; i++) {  
         var row$ = $('<tr/>');  
         for (var colIndex = 0; colIndex < columns.length; colIndex++) {  
             var cellValue = jsondata[i][columns[colIndex]];  
             if (cellValue == null)  
                 cellValue = "";  
             row$.append($('<td/>').html(cellValue));  
         }  
         $(tableid).append(row$);  
     }  
 }  
 function BindTableHeader(jsondata, tableid) {/*Function used to get all column names from JSON and bind the html table header*/  
     var columnSet = [];  
     var headerTr$ = $('<tr/>');  
     for (var i = 0; i < jsondata.length; i++) {  
         var rowHash = jsondata[i];  
         for (var key in rowHash) {  
             if (rowHash.hasOwnProperty(key)) {  
                 if ($.inArray(key, columnSet) == -1) {/*Adding each unique column names to a variable array*/  
                     columnSet.push(key);  
                     headerTr$.append($('<th/>').html(key));  
                 }  
             }  
         }  
     }  
     $(tableid).append(headerTr$);  
     return columnSet;  
 }  