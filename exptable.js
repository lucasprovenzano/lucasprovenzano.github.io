function ExportToTable() {  
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xlsx)$/;  
    /*Checks whether the file is a valid excel file*/  
    var b10tumor = document.getElementById("b10tumor").value;
    var tir = document.getElementById("tir").value;
    var tablediv = document.getElementById("tabla_datos");
    if (!isNaN(tir) && tir > 0){
        if (!isNaN(b10tumor) && b10tumor > 0){
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
                        var cnt = 0; /*This is used for restricting the script to consider only first sheet of excel*/  
                        sheet_name_list.forEach(function (y) { /*Iterate through all sheets*/  
                            /*Convert the cell value to Json*/  
                            if (xlsxflag) {  
                                var exceljson = XLSX.utils.sheet_to_json(workbook.Sheets[y], {header:["boron","thermal","fast","gamma"]});  
                            }  
                            if (exceljson.length > 0 && cnt == 0) {  
                                Dw(exceljson);
                                isoE(exceljson);
                                tablediv.style.display = 'block';
                                DibujarTabla(exceljson, '#exceltable');  
                                DibujarGrafico(exceljson,'#myChart');
                                foms(exceljson);
                                cnt++;  
                            }  
                        });  
                        $('#exceltable').show();  
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
        else {
           alert("Please check Boron concentration value");
       } 
   }
   else { 
    alert("Please check irradiation time ");
}
} 

function BindTable(jsondata, tableid) {/*Function used to convert the JSON array to Html Table*/  
   var columns = BindTableHeader(jsondata, tableid); /*Gets all the column headings of Excel*/  
   for (var i = 0; i < jsondata[i].length; i++) {  
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
function Dw(jsondata){
    var rbe_boro = 3.8;
    var rbe_thn = 3.2;
    var rbe_fastn = 3.2;
    var rbe_g = 1;

    var btumor = Number(document.getElementById("b10tumor").value);
    var tir = Number(document.getElementById("tir").value);

    for (var i = 0; i < jsondata.length; i++) {
       jsondata[i].dw = ((jsondata[i].boron*rbe_boro*btumor)+(jsondata[i].thermal*rbe_thn)+(jsondata[i].fast*rbe_fastn)+(jsondata[i].gamma*rbe_g))*tir;
   } 
}

function DibujarTabla(jsondata, tableid){
    var tabla = "";
    for (var i = 0; i < jsondata.length; i++) {
        tabla = tabla + "<tr style='text-align: center;'>"
        for(var key in jsondata[i]){
            tabla = tabla + "<td style='text-align: center;'>" + jsondata[i][key].toPrecision(4) + "</td>";
        }
        tabla = tabla + "</tr>"
    } 
    $(tableid).append(tabla);

}
function DibujarGrafico(jsondata,chartid){

    var xData = jsondata.map(function (el) { return el.iso; });
    var xData2 = jsondata.map(function (el) { return el.dw; });
//var yData = jsondata.map(function (el) { return el.thermal; });

var xData = xData.sort((a,b)=>a-b);
var xData2 = xData2.sort((a,b)=>a-b);
var yData = new Array(jsondata.length);

xData.unshift(0);
xData2.unshift(0);
yData.unshift(100);

//dvh_vol = 100:-100/(length(dvh_dose)-1):0;

for (var i = 0; i < jsondata.length; i++) {
    yData[i] = 100-((100/jsondata.length)*i);
}

const data = xData.map((x, i) => {
  return {
    x: x,
    y: yData[i]
};
});

const data2 = xData2.map((x, i) => {
  return {
    x: x,
    y: yData[i]
};
});

var ctx = document.getElementById('myChart').getContext('2d');
var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'scatter',
    // The data for our dataset
    data: {
        datasets: [{
            label: "Iso Effective [Gyiso]",
            fill: false,
            borderColor: 'rgb(255, 99, 132)',
            data: data,
            radius: 0,
        },{
            label: "RBE Equivalent [Gyw]",
            fill: false,
            borderColor: 'rgb(132, 99, 255)',
            data: data2,
            radius: 0,
        }]
    },
    // Configuration options go here
    options: {
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Dose'
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Vol[%]'
                }
            }]
        }
    }
});
}

function isoE(jsondata){
    var btumor = Number(document.getElementById("b10tumor").value);
    var tir = Number(document.getElementById("tir").value);
    // components >> jsondata[i].x
    // var btumor =  3.5*b10;
    
    var alpha_r = 0.02957;
    var beta_r = alpha_r/10;
    var alphabeta_r = alpha_r/beta_r;
    
    var alphaboro = 0.34039;
    var beta_boro = (1.16e-4)*(1.16e-4);
    
    var alphanth = 0.3603;
    var beta_nth = (7.22e-5)*(7.22e-5);
    
    var alphanfast = alphanth;
    var beta_nfast = beta_nth;
    
    // Datos Schmid 2010,HeLa cells
    var tof = 24/0.693;
    var tos = 14*60/0.693;
    // Proporciones Schmid (low LET), Schmid (high LET)
    var pf_g = 0.53;
    var ps_g = 0.47;
    var pf_bnct = 0.2;
    var ps_bnct = 0.8;
    // Time: tiempo referencia irrad con fotones
    var time = 30;
    var xf = tof/time;
    var xs = tos/time;
    
    var Gf = 2*xf*(1-xf*(1-Math.exp(-1/xf)));
    var Gs = 2*xs*(1-xs*(1-Math.exp(-1/xs)));
    
    // Contribuciones de cada componente
    var p_g = 1;
    var p_bnct = 0;
    var Gr = Gs-(p_g*pf_g+p_bnct*pf_bnct)*(Gs-Gf);
    
    xf = tof/tir;
    xs = tos/tir;
    
    Gf = 2*xf*(1-xf*(1-Math.exp(-1/xf)));
    Gs = 2*xs*(1-xs*(1-Math.exp(-1/xs)));
    
    var p_bnctB;
    var p_bnctN;
    var p_g;
    var G_12;
    var G_23;
    var G_31;
    var Dt;
    var Dosis_Tlineal;
    var Dosis_Tcuad;

    var G_11 = pf_bnct*Gf+ps_bnct*Gs;
    var G_22 = G_11;
    var G_33 = pf_g*Gf+ps_g*Gs;
    
    for (var i = 0; i < jsondata.length; i++) {
        Dt = (btumor*jsondata[i].boron) +(jsondata[i].thermal)+(jsondata[i].fast)+(jsondata[i].gamma);

        p_bnctB = (jsondata[i].boron*btumor)/Dt;
        p_bnctN = (jsondata[i].thermal+jsondata[i].fast)/Dt;
        p_g = jsondata[i].gamma/Dt;

        G_12 = Gs-(p_bnctB*pf_bnct+p_bnctN*pf_bnct)*(Gs-Gf);
        G_23 = Gs-(p_bnctN*pf_bnct+p_g*pf_g)*(Gs-Gf);
        G_31 = Gs-(p_g*pf_g+p_bnctB*pf_bnct)*(Gs-Gf);

        Dosis_Tlineal = alphaboro*(jsondata[i].boron*btumor);
        Dosis_Tlineal += (alphanth*jsondata[i].thermal);
        Dosis_Tlineal += (alphanfast*jsondata[i].fast);
        Dosis_Tlineal += (alpha_r*jsondata[i].gamma);
        Dosis_Tlineal = Dosis_Tlineal*tir;

        Dosis_Tcuad =  G_11*beta_boro*Math.pow(jsondata[i].boron*btumor,2);
        Dosis_Tcuad += G_22*beta_nth*Math.pow(jsondata[i].thermal,2);
        Dosis_Tcuad += G_22*beta_nfast*Math.pow(jsondata[i].fast,2);
        Dosis_Tcuad += G_33*beta_r*Math.pow(jsondata[i].gamma,2);
        Dosis_Tcuad += (2*G_12*Math.pow(beta_boro*beta_nth,0.5)*(jsondata[i].boron*btumor)*(jsondata[i].thermal));
        Dosis_Tcuad += (2*G_12*Math.pow(beta_boro*beta_nfast,0.5)*(jsondata[i].boron*btumor)*(jsondata[i].fast));
        Dosis_Tcuad += (2*G_31*Math.pow(beta_boro*beta_r,0.5)*(jsondata[i].boron*btumor)*(jsondata[i].gamma));
        Dosis_Tcuad += (2*G_11*Math.pow(beta_nth*beta_nfast,0.5)*(jsondata[i].thermal)*(jsondata[i].fast));
        Dosis_Tcuad += (2*G_23*Math.pow(beta_nth*beta_r,0.5)*(jsondata[i].thermal)*(jsondata[i].gamma));
        Dosis_Tcuad += (2*G_23*Math.pow(beta_nfast*beta_r,0.5)*(jsondata[i].fast)*(jsondata[i].gamma));
        Dosis_Tcuad = Math.pow(Dosis_Tcuad*tir,2);
        
        jsondata[i].iso = 0.5*(alphabeta_r/Gr)*(Math.pow(1+(4*Gr/alpha_r/alphabeta_r)*(Dosis_Tlineal+Dosis_Tcuad),0.5)-1);
    }
}

function foms(jsondata){

    var iso_dose = jsondata.map(function (el) { return el.iso; });
    var w_dose = jsondata.map(function (el) { return el.dw; });

    var iso_max = iso_dose[0];
    var iso_min = iso_dose[0];
    var sum_iso = 0;

    var w_max = w_dose[0];
    var w_min = w_dose[0];
    var sum_w = 0;

    for (var i = 0; i < iso_dose.length; i++) {
        if (iso_dose[i]>iso_max) { iso_max = iso_dose[i]}
            if (iso_dose[i]<iso_min) { iso_min = iso_dose[i]}
                sum_iso += iso_dose[i];

            if (w_dose[i]>w_max) { w_max = w_dose[i]}
                if (w_dose[i]<w_min) { w_min = w_dose[i]}
                    sum_w += w_dose[i];
            }

            var iso_mean = sum_iso/iso_dose.length;
            var w_mean = sum_w/w_dose.length;

            var max_txt_iso = "Max: " + iso_max.toPrecision(4) + " Gyiso";
            var mean_txt_iso = "Mean: " + iso_mean.toPrecision(4) + " Gyiso";
            var min_txt_iso = "Min: " + iso_min.toPrecision(4) + " Gyiso";

            var dmax_iso = document.getElementById('d_max_iso');
            var dmean_iso = document.getElementById('d_mean_iso');
            var dmin_iso = document.getElementById('d_min_iso');

            dmax_iso.innerHTML = max_txt_iso;
            dmean_iso.innerHTML = mean_txt_iso;
            dmin_iso.innerHTML = min_txt_iso;

            var max_txt_w = "Max: " + w_max.toPrecision(4) + " Gyw";
            var mean_txt_w = "Mean: " + w_mean.toPrecision(4) + " Gyw";
            var min_txt_w = "Min: " + w_min.toPrecision(4) + " Gyw";

            var dmax_w = document.getElementById('d_maxw');
            var dmean_w = document.getElementById('d_meanw');
            var dmin_w = document.getElementById('d_minw');

            dmax_w.innerHTML = max_txt_w;
            dmean_w.innerHTML = mean_txt_w;
            dmin_w.innerHTML = min_txt_w;

            var fom_id = document.getElementById('fom');

            $(fom_id).show();

        }
