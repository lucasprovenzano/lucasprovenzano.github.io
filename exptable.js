function ExportToTable() {  
  // Checks whether the file is a valid excel file
  var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xlsx)$/;  
  
  // Get boron 10 values from HTML form
  var b10= document.getElementById("b10").value;
  // Check if form input is empty to use default values
  if (b10.length===0) { b10 = "15"; }
  // Validate input data
  if (b10 < 0 || isNaN(b10)) {
    alert("Please check Boron concentration value");
    return false
  }

  // Get irradiation time from HTML form
  var tir = document.getElementById("tir").value;
  // Check if form input is empty to use default values
  if (tir.length === 0) { tir = "60"; }
  // Validate input data
  if (tir < 0 || isNaN(tir)) {
    alert("Please check Irradiation time value");
    return false
  }

  // Get tumor boron ratio from HTML form 
  var boronTumorRatio = document.getElementById("boronTumorRatio").value; 
  // Check if form input is empty to use default values
  if (boronTumorRatio.length === 0) { boronTumorRatio =  3.5; }
  // Validate input data
  if (boronTumorRatio < 0 || isNaN(boronTumorRatio)) {
    alert("Please check Tumor Boron Ratio value");
    return false
  }
  var b10tumor = b10 * boronTumorRatio;
  
  // Get voxel volumen from HTML form
  var vx_vol = document.getElementById("vx_vol").value;
  // Check if form input is empty to use default values
  if (vx_vol.length === 0) { vx_vol = "0.1"; }
  // Validate input data
  if (vx_vol < 0 || isNaN(vx_vol)) {
    alert("Please check Irradiation time value");
    return false
  }

  // Validate excel file
  var tablediv = document.getElementById("tabla_datos");
  if (!((regex.test($("#excelfile").val().toLowerCase())) 
    && ($("#excelfile").val().toLowerCase().indexOf(".xlsx") > 0))) {    
    alert("Please upload a valid Excel file!"); 
    return false 
  }

  // Flag for checking whether excel is .xls format or .xlsx format 
  var xlsxflag = true; 
  // Checks whether the browser supports HTML5
  if (typeof (FileReader) == "undefined") {     
    alert("Sorry! Your browser does not support HTML5!");  
    return false 
  }  

  // Get mucosa boron ratio from HTML form
  var boronMucosaRatio = document.getElementById("boronMucosaRatio").value;
  // Check if form input is empty to use default values
  if (boronMucosaRatio.length === 0) { boronMucosaRatio =  2; }
  // Validate input data
  if (boronMucosaRatio < 0 || isNaN(boronMucosaRatio)) {
    alert("Please check Mucosa Boron Ratio value");
    return false
  }
  var b10mucosa = b10 * boronMucosaRatio;

  // Get mucosa boron dose from HTML form
  var boronDose = document.getElementById("boronDose").value;
  // Check if form input is empty to use default values
  if (boronDose.length === 0) { boronDose = 0.002; }
  // Validate input data
  if (boronDose < 0 || isNaN(boronDose)) {
    alert("Please check Mucosa Boron Dose value");
    return false
  }

  // Get mucosa thermal neutron dose from HTML form
  var thermalNeutronDose = document.getElementById("thermalNeutronDose").value;
  // Check if form input is empty to use default values
  if (thermalNeutronDose.length === 0) { thermalNeutronDose =  0.0054; }
  // Validate input data
  if (thermalNeutronDose < 0 || isNaN(thermalNeutronDose)) {
    alert("Please check Mucosa Thermal Neutron Dose value");
    return false
  }

  // Get mucosa fast neutron dose from HTML form
  var fastNeutronDose = document.getElementById("fastNeutronDose").value;
  // Check if form input is empty to use default values
  if (fastNeutronDose.length === 0) { fastNeutronDose =  0.0013; }
  // Validate input data
  if (fastNeutronDose < 0 || isNaN(fastNeutronDose)) {
    alert("Please check Mucosa Fast Neutron Dose value");
    return false
  }
  
  // Get mucosa thermal neutron dose from HTML form
  var gammaDose = document.getElementById("gammaDose").value;
  // Check if form input is empty to use default values
  if (gammaDose.length === 0 || isNaN(gammaDose)) { gammaDose =  0.024; }
  // Validate input data
  if (gammaDose < 0) {
    alert("Please check Mucosa Gamma Dose value");
    return false
  }

  var reader = new FileReader();  
  reader.onload = function (e) {  
    var data = e.target.result;  
    // Converts the excel data in to object 
    if (xlsxflag) {  
      var workbook = XLSX.read(data, { type: 'buffer' });  
    }  
    // Gets all the sheetnames of excel in to a variable 
    var sheet_name_list = workbook.SheetNames;  
    // This is used for restricting the script to consider only first sheet of excel  
    var cnt = 0; 
    sheet_name_list.forEach(function (y) { /*Iterate through all sheets*/  
      /*Convert the cell value to Json*/  
      if (xlsxflag) {  
        var exceljson = XLSX.utils.sheet_to_json(workbook.Sheets[y], 
            {header:["boron","thermal","fast","gamma"]});  
      }  
      if (exceljson.length > 0 && cnt == 0) {  
        Dw(exceljson,b10tumor,tir);
        isoE(exceljson,b10tumor,tir);
        TCP(exceljson,vx_vol);
        NTCP(boronDose,thermalNeutronDose + 
            fastNeutronDose,gammaDose,b10mucosa,tir);
        tablediv.style.display = 'block';
        DibujarTabla(exceljson, '#exceltable');  
        DibujarGrafico(exceljson,'#myChart');
        foms(exceljson);
        UTCP();
        cnt++;  
        document.getElementById("viewfile").disabled = true;
      }  
    });  
    $('#exceltable').show();  
  }  
  if (xlsxflag) {
    //If excel file is .xlsx extension than creates a Array Buffer from excel  
    reader.readAsArrayBuffer($("#excelfile")[0].files[0]);  
  }  
}

function BindTable(jsondata, tableid) {
  //Function used to convert the JSON array to Html Table
  var columns = BindTableHeader(jsondata, tableid); 
  //Gets all the column headings of Excel
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

function BindTableHeader(jsondata, tableid) {
  //Function used to get all column names from JSON and bind the html table header  
  var columnSet = [];  
  var headerTr$ = $('<tr/>');  
  for (var i = 0; i < jsondata.length; i++) {  
    var rowHash = jsondata[i];  
    for (var key in rowHash) {  
      if (rowHash.hasOwnProperty(key)) {  
        if ($.inArray(key, columnSet) == -1) {
          // Adding each unique column names to a variable array
          columnSet.push(key);  
          headerTr$.append($('<th/>').html(key));  
        }  
      }  
    }  
  }  
  $(tableid).append(headerTr$);  
  return columnSet;  
}  

function Dw(jsondata,btumor,tir) {
  var rbe_boro = 3.8;
  var rbe_thn = 3.2;
  var rbe_fastn = 3.2;
  var rbe_g = 1;

  btumor = Number(btumor);
  tir = Number(tir);
  for (var i = 0; i < jsondata.length; i++) {
    jsondata[i].dw = ((jsondata[i].boron * rbe_boro*btumor) + 
                      (jsondata[i].thermal * rbe_thn) + 
                      (jsondata[i].fast * rbe_fastn) + 
                      (jsondata[i].gamma * rbe_g)) * tir;
  } 
}

function DibujarTabla(jsondata, tableid) {
  var tabla = "";
  for (var i = 0; i < jsondata.length; i++) {
    tabla = tabla + "<tr style='text-align: center;'>"
    for(var key in jsondata[i]) {
      tabla = tabla + "<td style='text-align: center;'>" + 
        jsondata[i][key].toPrecision(4) + "</td>";
    }
    tabla = tabla + "</tr>"
  } 
  $(tableid).append(tabla);
}

function DibujarGrafico(jsondata,chartid) {
  var xData = jsondata.map(function (el) { return el.iso; });
  var xData2 = jsondata.map(function (el) { return el.dw; });
  
  var xData = xData.sort((a,b) => a - b);
  var xData2 = xData2.sort((a,b) => a - b);
  var yData = new Array(jsondata.length);

  xData.unshift(0);
  xData2.unshift(0);
  yData.unshift(100);

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

function isoE(jsondata,btumor,tir) {
  btumor = Number(btumor);
  tir = Number(tir);
    
  var alpha_r = 0.02957;
  var beta_r = alpha_r / 10;
  var alphabeta_r = alpha_r / beta_r;

  var alphaboro = 0.34039;
  var beta_boro = 1.16e-4 * 1.16e-4;
    
  var alphanth = 0.3603;
  var beta_nth = 7.22e-5 * 7.22e-5;
    
  var alphanfast = alphanth;
  var beta_nfast = beta_nth;
    
  // Schmid 2010,HeLa cells data
  var tof = 24 / 0.693;
  var tos = 14 * 60 / 0.693;
  // Schmid (low LET), Schmid (high LET) proportions
  var pf_g = 0.53;
  var ps_g = 0.47;
  var pf_bnct = 0.2;
  var ps_bnct = 0.8;
  // Time: photon irradiation reference time
  var time = 30;
  var xf = tof / time;
  var xs = tos / time;
    
  var Gf = 2 * xf * (1 - xf * (1 - Math.exp(-1 / xf)));
  var Gs = 2 * xs * (1 - xs * (1 - Math.exp(-1 / xs)));
    
  // contribution of each component
  var p_g = 1;
  var p_bnct = 0;
  var Gr = Gs - (p_g * pf_g + p_bnct * pf_bnct) * (Gs - Gf);
    
  xf = tof / tir;
  xs = tos / tir;
    
  Gf = 2 * xf * (1 - xf * (1 - Math.exp(-1 / xf)));
  Gs = 2 * xs * (1 - xs * (1 - Math.exp(-1 / xs)));
    
  var p_bnctB;
  var p_bnctN;
  var p_g;
  var G_12;
  var G_23;
  var G_31;
  var Dt;
  var Dosis_Tlineal;
  var Dosis_Tcuad;

  var G_11 = pf_bnct * Gf + ps_bnct * Gs;
  var G_22 = G_11;
  var G_33 = pf_g * Gf + ps_g * Gs;
    
  for (var i = 0; i < jsondata.length; i++) {
    Dt = (btumor * jsondata[i].boron) + (jsondata[i].thermal) +
         (jsondata[i].fast)+(jsondata[i].gamma);
    p_bnctB = (jsondata[i].boron * btumor) / Dt;
    p_bnctN = (jsondata[i].thermal + jsondata[i].fast) / Dt;
    p_g = jsondata[i].gamma / Dt;
    G_12 = Gs - (p_bnctB * pf_bnct + p_bnctN * pf_bnct) * (Gs - Gf);
    G_23 = Gs - (p_bnctN * pf_bnct + p_g * pf_g) * (Gs - Gf);
    G_31 = Gs - (p_g * pf_g + p_bnctB * pf_bnct) * (Gs - Gf);
    Dosis_Tlineal = alphaboro * (jsondata[i].boron * btumor);
    Dosis_Tlineal += (alphanth * jsondata[i].thermal);
    Dosis_Tlineal += (alphanfast * jsondata[i].fast);
    Dosis_Tlineal += (alpha_r * jsondata[i].gamma);
    Dosis_Tlineal = Dosis_Tlineal * tir;
    Dosis_Tcuad =  G_11 * beta_boro * Math.pow(jsondata[i].boron * btumor,2);
    Dosis_Tcuad += G_22 * beta_nth * Math.pow(jsondata[i].thermal,2);
    Dosis_Tcuad += G_22 * beta_nfast * Math.pow(jsondata[i].fast,2);
    Dosis_Tcuad += G_33 * beta_r * Math.pow(jsondata[i].gamma,2);
    Dosis_Tcuad += (2 * G_12 * Math.pow(beta_boro * beta_nth,0.5) * 
        (jsondata[i].boron * btumor) * (jsondata[i].thermal));
    Dosis_Tcuad += (2 * G_12 * Math.pow(beta_boro * beta_nfast,0.5) * 
        (jsondata[i].boron * btumor) * (jsondata[i].fast));
    Dosis_Tcuad += (2 * G_31 * Math.pow(beta_boro * beta_r,0.5) * 
        (jsondata[i].boron * btumor) * (jsondata[i].gamma));
    Dosis_Tcuad += (2 * G_11 * Math.pow(beta_nth * beta_nfast,0.5) * 
        (jsondata[i].thermal) * (jsondata[i].fast));
    Dosis_Tcuad += (2 * G_23 * Math.pow(beta_nth * beta_r,0.5) * 
        (jsondata[i].thermal) * (jsondata[i].gamma));
    Dosis_Tcuad += (2 * G_23 * Math.pow(beta_nfast * beta_r,0.5) * 
        (jsondata[i].fast) * (jsondata[i].gamma));
    Dosis_Tcuad = Math.pow(Dosis_Tcuad * tir,2);
    jsondata[i].iso = 0.5 * (alphabeta_r / Gr) * 
        (Math.pow(1 + (4 * Gr / alpha_r / alphabeta_r) * 
        (Dosis_Tlineal + Dosis_Tcuad),0.5) - 1);
  }
}

function foms(jsondata) {
  var iso_dose = jsondata.map(function (el) { return el.iso; });
  var w_dose = jsondata.map(function (el) { return el.dw; });

  var iso_max = iso_dose[0];
  var iso_min = iso_dose[0];
  var sum_iso = 0;

  var w_max = w_dose[0];
  var w_min = w_dose[0];
  var sum_w = 0;

  for (var i = 0; i < iso_dose.length; i++) {
    if (iso_dose[i] > iso_max) { iso_max = iso_dose[i]}
    if (iso_dose[i] < iso_min) { iso_min = iso_dose[i]}
    sum_iso += iso_dose[i];
    if (w_dose[i] > w_max) { w_max = w_dose[i]}
    if (w_dose[i] < w_min) { w_min = w_dose[i]}
    sum_w += w_dose[i];
  }

  var iso_mean = sum_iso / iso_dose.length;
  var w_mean = sum_w / w_dose.length;

  var max_txt_iso = iso_max.toPrecision(4) + " Gy<sub>iso</sub>";
  var mean_txt_iso = iso_mean.toPrecision(4) + " Gy<sub>iso</sub>";
  var min_txt_iso = iso_min.toPrecision(4) + " Gy<sub>iso</sub>";

  var dmax_iso = document.getElementById('d_max_iso');
  var dmean_iso = document.getElementById('d_mean_iso');
  var dmin_iso = document.getElementById('d_min_iso');

  dmax_iso.innerHTML = max_txt_iso;
  dmean_iso.innerHTML = mean_txt_iso;
  dmin_iso.innerHTML = min_txt_iso;

  var max_txt_w = w_max.toPrecision(4) + " Gy<sub>w</sub>";
  var mean_txt_w = w_mean.toPrecision(4) + " Gy<sub>w</sub>";
  var min_txt_w = w_min.toPrecision(4) + " Gy<sub>w</sub>";

  var dmax_w = document.getElementById('d_maxw');
  var dmean_w = document.getElementById('d_meanw');
  var dmin_w = document.getElementById('d_minw');

  dmax_w.innerHTML = max_txt_w;
  dmean_w.innerHTML = mean_txt_w;
  dmin_w.innerHTML = min_txt_w;

  var fom_id = document.getElementById('fom');
  $(fom_id).show();
}

function TCP(jsondata,dv) { 
  var dose = jsondata.map(function (el) { return el.iso; });
  var dv = Number(dv);

  var Ar = 0.02957;
  var Br = Ar / 10;
  var c1 = 22.59;
  var c2 = 0.3345;

  var tof = 24 / 0.693;
  var tos = 14 * 60 / 0.693;

  var pf_g = 0.53;
  var ps_g = 0.47;
  var pf_bnct = 0.2;
  var ps_bnct = 0.8;

  var time = 30;
  var xf = tof / time;
  var xs = tos / time;

  var Gf = 2 * xf * (1 - xf * (1 - Math.exp(-1 / xf)));
  var Gs = 2 * xs * (1 - xs * (1 - Math.exp(-1 / xs)));

  var p_g = 1;
  var p_bnct = 0;

  var Gr = Gs - (p_g * pf_g + p_bnct * pf_bnct) * (Gs - Gf);
  var H = 0;

  for (var i = 0; i < dose.length; i++) {
    H += Math.pow(Math.exp( - Ar * dose[i] - Gr * Br *
      Math.pow(dose[i],2)),(1 / c2)); 
  }
    
  var tcp_isoe = Math.pow(Math.exp(-c1 * (H * dv)),c2);
  var tcp_txt =  tcp_isoe.toPrecision(2);
  var tcp_iso = document.getElementById('tcp_iso');
  tcp_iso.innerHTML = tcp_txt;
}

function NTCP(b,n,g,b10mucosa,tir) {
  var Dtot = (b * b10mucosa + n + g) * tir;
  var fb = (b * b10mucosa * tir) / Dtot;
  var fn = (n * tir) / Dtot;
  var fg = (g * tir) / Dtot;
  var param = [2.468388470867692, 0.000100508105922, 
               3.090888558919538, 0.000091579941911];
  var TD50g = 39.8;
  var mg = 0.17;

  //Strigari.
  var a = 0.35;
  var ab = 10;
  // Datos Stuben 1997, mouse lip mucosa
  var tof = 27 / 0.693;
  var tos = 150 / 0.693;
  // Stuben (low LET), Schmid (high LET) proportions
  var pf_g = 0.8;
  var ps_g = 0.2;
  var pf_bnct = 0.2;
  var ps_bnct = 0.8;
  // Time: photon irradiation reference time
  var time = 30;
  var xf = tof / time;
  var xs = tos / time;
  var Gf = 2 * xf * (1 - xf * (1 - Math.exp(-1 / xf)));
  var Gs = 2 * xs * (1 - xs * (1 - Math.exp(-1 / xs)));

  // contribution of each component
  var p_gr = 1;
  var p_bnctr = 0;
  // i = gamma low let
  // j = bnct high let
  var Gr = Gs - (p_gr * pf_g + p_bnctr * pf_bnct) * (Gs - Gf);
  // Gij 
  // contribution of each component
  var p_bnctB = fb;
  var p_bnctN = fn;
  var p_g = fg;
  // 3 = gamma low let
  // 2 = neutorn bnct high let
  // 1 = boro high let

  // Gii
  var G_11 = pf_bnct * Gf + ps_bnct * Gs;
  var G_22 = G_11;
  var G_33 = pf_g * Gf + ps_g * Gs;

  var G_12 = Gs - (p_bnctB * pf_bnct + p_bnctN * pf_bnct) * (Gs - Gf);
  var G_23 = Gs - (p_bnctN * pf_bnct + p_g * pf_g) * (Gs - Gf);
  var G_31 = Gs - (p_g * pf_g + p_bnctB * pf_bnct) * (Gs - Gf);

  var A = G_11 * Math.pow(fb,2) * Math.pow(param[3],4);
  A += G_22 * Math.pow(fn,2) * Math.pow(param[1],4);
  A += G_33 * Math.pow(fg,2) * (a / 10);
  A += 2 * G_12 * fb * fn * Math.pow(param[3] * param[1],2);
  A += 2 * G_23 * fn * fg * Math.pow(Math.pow(param[1],4) * (a / 10),0.5);
  A += 2 * G_31 * fg * fb * Math.pow(Math.pow((a / 10) * param[3],4),0.5);

  var Dsf = 0.5 * (ab / Gr) *  (Math.pow(1 + (4 * Gr / ab / a) * 
       ((fb * param[2] + fn * param[0] + fg * a) * Dtot + A * 
        Math.pow(Dtot,2)),0.5) - 1);

  var Dloca = Dsf * (ab + Dsf) / (ab + 2);
  var s = (Dloca - TD50g) / (mg * TD50g);
  var ntcp_isoe = 1 / 2 * (1 + erf(s));

  var ntcp_txt = ntcp_isoe.toPrecision(2);
  var ntcp_iso = document.getElementById('ntcp_iso');
  ntcp_iso.innerHTML = ntcp_txt;

  //console.log(ntcp_txt);

  var Diso_txt = Dsf.toPrecision(2) + " Gy<sub>iso</sub>";
  var mucosa_iso = document.getElementById('mucosa_iso');
  mucosa_iso.innerHTML = Diso_txt;

  var Df_txt = Dtot.toPrecision(2) + " Gy";
  var mucosa_f = document.getElementById('mucosa_f');
  mucosa_f.innerHTML = Df_txt;

  //console.log(Dsf);

  var fom_mucosa= document.getElementById('fom_mucosa');
  $(fom_mucosa).show();
}

function erf(x) {
  // erf(x) = 2/sqrt(pi) * integrate(from=0, to=x, e^-(t^2) ) dt
  // with using Taylor expansion, 
  //        = 2/sqrt(pi) * sigma(n=0 to +inf, ((-1)^n * x^(2n+1))/(n! * (2n+1)))
  // calculationg n=0 to 50 bellow (note that inside sigma equals x when n = 0, and 50 may be enough)
  var m = 1.00;
  var s = 1.00;
  var sum = x * 1.0;
  for(var i = 1; i < 50; i++) {
    m *= i;
    s *= -1;
    sum += (s * Math.pow(x, 2.0 * i + 1.0)) / (m * (2.0 * i + 1.0));
  }  
  return 2 * sum / Math.sqrt(Math.PI);
}

function UTCP() {
  var ntcp = document.getElementById('ntcp_iso').innerHTML;
  var tcp = document.getElementById('tcp_iso').innerHTML;
  var utcp = Number(tcp) * (1 - Number(ntcp));
  var utcp_txt = utcp.toPrecision(2); 
  var UTCP_value = document.getElementById('UTCP_value');
    UTCP_value.innerHTML =utcp_txt;
  var fom_utcp= document.getElementById('fom_utcp');
  $(fom_utcp).show();
}