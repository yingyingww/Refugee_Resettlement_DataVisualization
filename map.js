/* map.js
 * Builds visualization showing refugee movement from UNHCR data in three world maps.
Yingying Wang, Claudia Naughton 
11/19/18
CS314
 */

var width = 1000;
var height = 400;

var geoData;        
var stateData;      
var stateToData;    
var colorScale;
var colorScale2;
var state;          

var currentYear = 2017;

var sampleVar;
var mapChoice = "default";
var clickedCountry="ORriginalword";

//make map initial time on default view in year 2017
makeMap();

//functions to switch between maps based on button choice
d3.select("#default").on("click", function(){
    d3.select("svg").remove();
    mapChoice = "default";
    makeMap();
    });

d3.select("#byOrigin").on("click", function(){
    d3.select("svg").remove();
    mapChoice = "byOrigin";
    makeMapByOrigin();
    });


d3.select("#byResettlement").on("click", function(){
    d3.select("svg").remove();
    makeMapByResettlement();
    });


function makeMap(){
    //define projection, generate paths
    var projection = d3.geo.equirectangular();
    var geoPath = d3.geo.path()
        .projection(projection);

    var svg = d3.select("#mapDiv").append("svg")
        .attr("width", width)
        .attr("height", height);

    
var buildMap = function() {

    // Create country paths
    state = svg.selectAll('.state')
        .data(geoData.features)
    
    state
        .enter()
        .append('path')
        .attr('class', 'state')
        .attr('d', geoPath)
        .on('mouseover', function(d) {
            //on mouseover highlight boundary, display name in infobox, update tooltip
            d3.select(this)
            .style('stroke', '#17202A')
            .style('stroke-width', 1.2)
            d3.select(".infobox .country").text(d.properties.sovereignt);

            if (typeof stateToData[d.properties.sovereignt] != "undefined"){
                d3.select(".infobox .inbound").text(
                stateToData[d.properties.sovereignt]['ResettlementTotal']);
            }
            if (typeof stateToData[d.properties.sovereignt] == "undefined"){
                d3.select(".infobox .inbound").text(0);
            }
            if (typeof originCountryData[d.properties.sovereignt] != "undefined"){
                d3.select(".infobox .outbound").text(originCountryData[d.properties.sovereignt]['OriginTotal']);
            }
            if (typeof originCountryData[d.properties.sovereignt] == "undefined"){
                d3.select(".infobox .outbound").text(0);
            }
            d3.select(".infobox").style('visibility', 'visible');

            d3.select(this).select('title')
                .text(function(d) {
                    testCountry = stateToData[d.properties.sovereignt];
                    originCountry = originCountryData[d.properties.sovereignt];
                    if (typeof testCountry != "undefined" && typeof originCountry != "undefined"){
                        sampleVar = stateToData[d.properties.sovereignt]['ResettlementTotal'];
                        return d.properties.sovereignt + ": " + "Inbound Refugees = " + sampleVar + " Outbound Refugees = " + originCountryData[d.properties.sovereignt]['OriginTotal'];
                    }
                    if (typeof testCountry != "undefined"){
                        return d.properties.sovereignt + ": " + "Inbound Refugees = " + stateToData[d.properties.sovereignt]['ResettlementTotal'] + ", no outbound refugees";
                    }
                    if (typeof originCountry != "undefined"){
                        return d.properties.sovereignt + ": " + "Outbound Refugees = " + originCountryData[d.properties.sovereignt]['OriginTotal'] + ", no inbound refugees";
                    }
                     else{
                        return 'No data for this country';
                    }
                });
    
        })
        .on('mouseout', function() {
            d3.select(this)
             .style('stroke', 'gray')
             .style('stroke-width', .5) 
             .style('fill', function(d){
                //return fill to what it was
                testCountry = stateToData[d.properties.sovereignt];
                originCountry = originCountryData[d.properties.sovereignt];
                if (typeof originCountry != "undefined" && typeof testCountry != "undefined"){
                    //refugees in both directions
                    if (parseInt(stateToData[d.properties.sovereignt]['ResettlementTotal']) >= 
                       parseInt(originCountryData[d.properties.sovereignt]['OriginTotal'])){
                       return colorScale(stateToData[d.properties.sovereignt]['ResettlementTotal']);
                    }
                    else{
                       return colorScale2(originCountryData[d.properties.sovereignt]['OriginTotal']);
                    }
                }
                if (typeof testCountry != "undefined"){ 
                    return colorScale(stateToData[d.properties.sovereignt]['ResettlementTotal']);
                }
                if (typeof originCountry != "undefined"){
                    return colorScale2(originCountryData[d.properties.sovereignt]['OriginTotal']);
                }
            })
            d3.select(".infobox").style('visibility', 'hidden');
        })
        .style('fill', function(d){
            //if this country has data in the countryData file, color country
            testCountry = stateToData[d.properties.sovereignt];
            originCountry = originCountryData[d.properties.sovereignt];
            if (typeof originCountry != "undefined" && typeof testCountry != "undefined"){
               //refugees in both directions
               if (parseInt(stateToData[d.properties.sovereignt]['ResettlementTotal']) >= 
                   parseInt(originCountryData[d.properties.sovereignt]['OriginTotal'])){
                   return colorScale(stateToData[d.properties.sovereignt]['ResettlementTotal']);
                   
               }
               else{
                   return colorScale2(originCountryData[d.properties.sovereignt]['OriginTotal']);
               }
            }
            if (typeof testCountry != "undefined"){
                    return colorScale(stateToData[d.properties.sovereignt]['ResettlementTotal']);
                }
            if (typeof originCountry != "undefined"){
                    return colorScale2(originCountryData[d.properties.sovereignt]['OriginTotal']);
            }
        })
        .append('svg:title').text("blank");        
};
    
d3.json('custom.geo.json', function(error, jsonData) {
    geoData = jsonData;

    d3.csv('default.csv', function(csvData) {
        stateData = csvData;

        updateByYear(2017,clickedCountry);
        
        //set color scale for country of resettlement: (min, 25%, median, 75%, and max values)
        var minColor = '#edf8e9';
        var quarterColor = '#bae4b3';
        var medianColor = '#74c476';
        var threequarterColor = '#31a354';
        var maxColor = '#006d2c';
        
        colorScale = d3.scale.linear()
            .domain([1, 28.5, 309, 1093, 96874])
            .range([minColor,quarterColor, medianColor, threequarterColor,maxColor])
            .interpolate(d3.interpolateLab);
        
        //colorscale for country of origin: (min, 25%, median, 75%, and max values)
        var minColor2 = '#fee5d9';
        var quarterColor2 = '#fcae91';
        var medianColor2 = '#fb6a4a';
        var threequarterColor2 = '#de2d26';
        var maxColor2 = '#a50f15';

        colorScale2 = d3.scale.linear()
            .domain([1,6,28,215,63032])
            .range([minColor2,quarterColor2, medianColor2, threequarterColor2,maxColor2])
            .interpolate(d3.interpolateLab);
    
        //Slider to get Year input
        var slider = document.getElementById("myRange");
        var output = document.getElementById("year");
        output.innerHTML = slider.value;
        slider.oninput = function() {
            output.innerHTML = this.value
            updateByYear(this.value);
        }
        
        function updateByYear(currentYear) {
        //update map data when slidebar is used
            stateToData = {};
            originCountryData = {};
            var RyearData = stateData.filter(
                function(d){
                    return (d['ResettlementYear'] == currentYear)});
                    
            var OyearData = stateData.filter(
                function(d){
                    return (d['OriginYear'] == currentYear)});

            for (var i = 0; i < RyearData.length; i++){
                //update based on resettlement data
                 stateToData[RyearData[i]['ResettlementCountry']] = RyearData[i];
                 d3.selectAll('.state')
                 .style('fill', function(d){
                    testCountry = stateToData[d.properties.sovereignt];
                    originCountry = originCountryData[d.properties.sovereignt];
                    if (typeof originCountry != "undefined" && typeof testCountry != "undefined"){
                       if (parseInt(stateToData[d.properties.sovereignt]['ResettlementTotal']) >= 
                           parseInt(originCountryData[d.properties.sovereignt]['OriginTotal'])){
                           return colorScale(stateToData[d.properties.sovereignt]['ResettlementTotal']);
                        }
                        else{
                            return colorScale2(originCountryData[d.properties.sovereignt]['OriginTotal']);
                        }
                    }
                    if (typeof testCountry != "undefined"){
                        return colorScale(stateToData[d.properties.sovereignt]['ResettlementTotal']);
                    }
                    if (typeof originCountry != "undefined"){
                        return colorScale2(originCountryData[d.properties.sovereignt]['OriginTotal']);
                    }
                })

            }
            for (var i = 0; i < OyearData.length; i++){
                //update based on origin data
                originCountryData[OyearData[i]['OriginCountry']] = OyearData[i];
                d3.selectAll('.state')
                .style('fill', function(d){
                    testCountry = stateToData[d.properties.sovereignt];
                    originCountry = originCountryData[d.properties.sovereignt];
                    if (typeof originCountry != "undefined" && typeof testCountry != "undefined"){
                       if (parseInt(stateToData[d.properties.sovereignt]['ResettlementTotal']) >= 
                           parseInt(originCountryData[d.properties.sovereignt]['OriginTotal'])){
                           return colorScale(stateToData[d.properties.sovereignt]['ResettlementTotal']);
                        }
                        else{
                            return colorScale2(originCountryData[d.properties.sovereignt]['OriginTotal']);
                        }
                    }
                    if (typeof testCountry != "undefined"){
                        return colorScale(stateToData[d.properties.sovereignt]['ResettlementTotal']);
                    }
                    if (typeof originCountry != "undefined"){
                        return colorScale2(originCountryData[d.properties.sovereignt]['OriginTotal']);
                    }
                })
            }
        }
        buildMap();
    });
})
};


//make "By Country of Origin" map, which only initially shows countries that refugees originated from. 
//Highlighting countries shows their destinations
function makeMapByOrigin(){

    var projection = d3.geo.equirectangular();
    var geoPath = d3.geo.path()
        .projection(projection);

    var svg = d3.select("#mapDiv").append("svg")
        .attr("width", width)
        .attr("height", height);

    var buildMap = function() {
        state = svg.selectAll('.state')
            .data(geoData.features)

        //create states using methods in the default map
        state
            .enter()
            .append('path')
            .attr('class', 'state')
            .attr('d', geoPath)
            .style('fill', function(d){
                testCountry = stateToData[d.properties.sovereignt];
                originCountry = originCountryData[d.properties.sovereignt];
                if (typeof originCountry != "undefined"){
                        return colorScale2(originCountryData[d.properties.sovereignt]['OriginTotal']);
                }
            })
            .on('mouseover', function(d) {
                d3.select(this)
                .style('stroke', '#17202A')
                .style('stroke-width', 1)
                d3.select(".infobox .country").text(d.properties.sovereignt);
                if (typeof stateToData[d.properties.sovereignt] != "undefined"){
                    d3.select(".infobox .inbound").text(
                    stateToData[d.properties.sovereignt]['ResettlementTotal']);
                }
                if (typeof stateToData[d.properties.sovereignt] == "undefined"){
                    d3.select(".infobox .inbound").text(0);
                }
                if (typeof originCountryData[d.properties.sovereignt] != "undefined"){
                    d3.select(".infobox .outbound").text(originCountryData[d.properties.sovereignt]['OriginTotal']);
                }
                if (typeof originCountryData[d.properties.sovereignt] == "undefined"){
                    d3.select(".infobox .outbound").text(0);
                }
                d3.select(".infobox").style('visibility', 'visible');

                d3.select(this).select('title')
                    .text(function(d) {
                        testCountry = stateToData[d.properties.sovereignt];
                        originCountry = originCountryData[d.properties.sovereignt];
                        if (typeof testCountry != "undefined" && typeof originCountry != "undefined"){
                            sampleVar = stateToData[d.properties.sovereignt]['ResettlementTotal'];
                            return d.properties.sovereignt + ": " + "Inbound Refugees = " + sampleVar + " Outbound Refugees = " + originCountryData[d.properties.sovereignt]['OriginTotal'];
                        }
                        if (typeof testCountry != "undefined"){
                            return d.properties.sovereignt + ": " + "Inbound Refugees = " + stateToData[d.properties.sovereignt]['ResettlementTotal'] + ", no outbound refugees";
                        }
                        if (typeof originCountry != "undefined"){
                            return d.properties.sovereignt + ": " + "Outbound Refugees = " + originCountryData[d.properties.sovereignt]['OriginTotal'] + ", no inbound refugees";
                        }
                         else{
                            return 'No data for this country';
                        }
                    });

                //info for when country is highlighted
                clickedCountry = d.properties.sovereignt
                updateByYearAndCountry(currentYear,clickedCountry);
                d3.selectAll('.state')
                    .style('fill', "#a6a6a6");        
                    d3.selectAll('.state')
                    .style('fill', function(d){
                        for (i in Object.keys(byOriginData)){
                           if (byOriginData[i]["ResettlementCountry"] == d.properties.sovereignt){
                               return colorScale(byOriginData[i]["Value"]);
                           }
                        } 
                    });
                if (typeof originCountryData[d.properties.sovereignt] != 'undefined'){
                    d3.select(this)
                        .style('fill', function(){
                        return colorScale2(originCountryData[d.properties.sovereignt]['OriginTotal'])
                        }); 
                }
                })
            .on('mouseout', function() {
                d3.select(this)
                 .style('stroke', 'gray')
                 .style('stroke-width', .5) 
            d3.selectAll('.state')
                    .style('fill', "#a6a6a6")
            .style('fill', function(d){
                testCountry = stateToData[d.properties.sovereignt];
                originCountry = originCountryData[d.properties.sovereignt];
 
                if (typeof originCountry != "undefined"){
                        return colorScale2(originCountryData[d.properties.sovereignt]['OriginTotal']);
                }
            })
            .append('svg:title').text("blank"); 
                d3.select(".infobox").style('visibility', 'hidden');
            })
    };
    
    
function updateByYearAndCountry(currentYear,country) {

                stateToData = {};
                originCountryData = {};
                byOriginData={};
                
                var realYearData = realData.filter(
                    function(d){
                    return(d['Year']==currentYear)
                    }
                );
                var tryt = realYearData.filter(
                    function(d){
                        return (d['OriginCountry'])==clickedCountry
                    }
                );
                for (var i=0; i<tryt.length; i++){
                    byOriginData[i] = tryt[i];
                }
                    
                //statedata for default display
                var RyearData = stateData.filter(
                    function(d){
                        return (d['ResettlementYear'] == currentYear)});

                var OyearData = stateData.filter(
                    function(d){
                        return (d['OriginYear'] == currentYear)});

                for (var i = 0; i < RyearData.length; i++){
                     stateToData[RyearData[i]['ResettlementCountry']] = RyearData[i];
                     d3.selectAll('.state')
                     .style('fill', function(d){
                        testCountry = stateToData[d.properties.sovereignt];
                        originCountry = originCountryData[d.properties.sovereignt];

                        if (typeof originCountry != "undefined"){
                            return colorScale2(originCountryData[d.properties.sovereignt]['OriginTotal']);
                        }
                    })

                }
                for (var i = 0; i < OyearData.length; i++){
                    originCountryData[OyearData[i]['OriginCountry']] = OyearData[i];
                    d3.selectAll('.state')
                    .style('fill', function(d){
                        testCountry = stateToData[d.properties.sovereignt];
                        originCountry = originCountryData[d.properties.sovereignt];
                        if (typeof originCountry != "undefined"){
                            return colorScale2(originCountryData[d.properties.sovereignt]['OriginTotal']);
                        }
                    })              
                }
                
               
            }
    d3.json('custom.geo.json', function(error, jsonData) {
        geoData = jsonData;

        d3.csv('default.csv', function(csvData) {
            stateData = csvData;
            d3.csv('rawdata.csv', function(csvData2){
            realData = csvData2;
            updateByYearAndCountry(2017,clickedCountry);

        //colorscale for country of origin: (min, 25%, median, 75%, and max values)
        var minColor2 = '#fee5d9';
        var quarterColor2 = '#fcae91';
        var medianColor2 = '#fb6a4a';
        var threequarterColor2 = '#de2d26';
        var maxColor2 = '#a50f15';

        colorScale2 = d3.scale.linear()
            .domain([1,6,28,215,63032])
            .range([minColor2,quarterColor2, medianColor2, threequarterColor2,maxColor2])
            .interpolate(d3.interpolateLab);

            //Slider to get Year input
            var slider = document.getElementById("myRange");
            var output = document.getElementById("year");
            output.innerHTML = slider.value;
            slider.oninput = function() {
                output.innerHTML = this.value
                currentYear = this.value
                updateByYearAndCountry(this.value, clickedCountry);
            }

            buildMap();
                
            });  
        });
    })
};
            

//makes "By Country of Resettlement" map, which only initially shows countries that refugees resettled in. 
//Highlighting countries shows the countries of origin
function makeMapByResettlement(){

    var projection = d3.geo.equirectangular();
    var geoPath = d3.geo.path()
        .projection(projection);

    var svg = d3.select("#mapDiv").append("svg")
        .attr("width", width)
        .attr("height", height);

    
    var buildMap = function() {
        state = svg.selectAll('.state')
            .data(geoData.features)

        state
            .enter()
            .append('path')
            .attr('class', 'state')
            .attr('d', geoPath)
            .style('fill', function(d){
                testCountry = stateToData[d.properties.sovereignt];
                originCountry = originCountryData[d.properties.sovereignt];
    
                if (typeof testCountry != "undefined"){
                        return colorScale(stateToData[d.properties.sovereignt]['ResettlementTotal']);
                      
                    }

            })
            .on('mouseover', function(d) {
                d3.select(this)
                .style('stroke', '#17202A')
                .style('stroke-width', 1)
                d3.select(".infobox .country").text(d.properties.sovereignt);

                if (typeof stateToData[d.properties.sovereignt] != "undefined"){
                    d3.select(".infobox .inbound").text(
                    stateToData[d.properties.sovereignt]['ResettlementTotal']);
                }
                if (typeof stateToData[d.properties.sovereignt] == "undefined"){
                    d3.select(".infobox .inbound").text(0);
                }
                if (typeof originCountryData[d.properties.sovereignt] != "undefined"){
                    d3.select(".infobox .outbound").text(originCountryData[d.properties.sovereignt]['OriginTotal']);
                }
                if (typeof originCountryData[d.properties.sovereignt] == "undefined"){
                    d3.select(".infobox .outbound").text(0);
                }
                d3.select(".infobox").style('visibility', 'visible');

                d3.select(this).select('title')
                    .text(function(d) {
                        testCountry = stateToData[d.properties.sovereignt];
                        originCountry = originCountryData[d.properties.sovereignt];
                        if (typeof testCountry != "undefined" && typeof originCountry != "undefined"){
                            sampleVar = stateToData[d.properties.sovereignt]['ResettlementTotal'];

                            return d.properties.sovereignt + ": " + "Inbound Refugees = " + sampleVar + " Outbound Refugees = " + originCountryData[d.properties.sovereignt]['OriginTotal'];
                        }
                        if (typeof testCountry != "undefined"){
                            return d.properties.sovereignt + ": " + "Inbound Refugees = " + stateToData[d.properties.sovereignt]['ResettlementTotal'] + ", no outbound refugees";
                        }
                        if (typeof originCountry != "undefined"){
                            return d.properties.sovereignt + ": " + "Outbound Refugees = " + originCountryData[d.properties.sovereignt]['OriginTotal'] + ", no inbound refugees";
                        }
                         else{
                            return 'No data for this country';
                        }

                    });

                clickedCountry = d.properties.sovereignt

                updateByYearAndCountry(currentYear,clickedCountry);
                 d3.selectAll('.state')
                    .style('fill', "#a6a6a6");
                 d3.selectAll('.state')
                    .style('fill', function(d){
                            for (i in Object.keys(byResettleData)){
                           if (byResettleData[i]["OriginCountry"] == d.properties.sovereignt){
                               return colorScale2(byResettleData[i]["Value"]);
                           }
                       } 

                    });
                if (typeof stateToData[d.properties.sovereignt] != 'undefined'){
                    d3.select(this)
                        .style('fill', function(){
                        return colorScale(stateToData[d.properties.sovereignt]['ResettlementTotal']) 

                    });
                }

            })
            .on('mouseout', function() {
                d3.select(this)
                 .style('stroke', 'gray')
                 .style('stroke-width', .5)
            
                d3.selectAll('.state')
                    .style('fill', "#a6a6a6")

                .style('fill', function(d){
                    testCountry = stateToData[d.properties.sovereignt];
                    originCountry = originCountryData[d.properties.sovereignt];

                    if (typeof testCountry != "undefined"){
                            return colorScale(stateToData[d.properties.sovereignt]['ResettlementTotal']);

                        }

                })
                .append('svg:title').text("blank"); 
                d3.select(".infobox").style('visibility', 'hidden');
            })

    };
                
        function updateByYearAndCountry(currentYear,country) {

                stateToData = {};
                originCountryData = {};
                byResettleData={};
                
                var realYearData = realData.filter(
                    function(d){
                    return(d['Year']==currentYear)
                    }
                );
                var tryt = realYearData.filter(
                    function(d){
                        return (d['ResettlementCountry'])==clickedCountry
                    }
                );
                for (var i=0; i<tryt.length; i++){
                    byResettleData[i] = tryt[i];
                }
                    
                var RyearData = stateData.filter(
                    function(d){
                        return (d['ResettlementYear'] == currentYear)});

                var OyearData = stateData.filter(
                    function(d){
                        return (d['OriginYear'] == currentYear)});

                for (var i = 0; i < RyearData.length; i++){
                     stateToData[RyearData[i]['ResettlementCountry']] = RyearData[i];
                     d3.selectAll('.state')
                     .style('fill', function(d){
                        testCountry = stateToData[d.properties.sovereignt];
                        originCountry = originCountryData[d.properties.sovereignt];

                        if (typeof originCountry != "undefined"){
                            return colorScale2(originCountryData[d.properties.sovereignt]['OriginTotal']);
                        }
                    })

                }
                for (var i = 0; i < OyearData.length; i++){
                    originCountryData[OyearData[i]['OriginCountry']] = OyearData[i];
                    d3.selectAll('.state')
                    .style('fill', function(d){
                        testCountry = stateToData[d.properties.sovereignt];
                        originCountry = originCountryData[d.properties.sovereignt];
                        if (typeof testCountry != "undefined"){
                            return colorScale(stateToData[d.properties.sovereignt]['ResettlementTotal']);
                        }
                    })
                }
                
               
            }              

    d3.json('custom.geo.json', function(error, jsonData) {
        geoData = jsonData;

        d3.csv('default.csv', function(csvData) {
            stateData = csvData;
            d3.csv('rawdata.csv', function(csvData2){
            realData = csvData2;
            updateByYearAndCountry(2017,clickedCountry);
        var minColor = '#edf8e9';
        var quarterColor = '#bae4b3';
        var medianColor = '#74c476';
        var threequarterColor = '#31a354';
        var maxColor = '#006d2c';
        
        colorScale = d3.scale.linear()
            .domain([1, 28.5, 309, 1093, 96874])
            .range([minColor,quarterColor, medianColor, threequarterColor,maxColor])
            .interpolate(d3.interpolateLab);

            var slider = document.getElementById("myRange");
            var output = document.getElementById("year");
            output.innerHTML = slider.value;
            slider.oninput = function() {
                output.innerHTML = this.value
                currentYear = this.value
                updateByYearAndCountry(this.value, clickedCountry);
            }
            buildMap();
            });

        });
    })
};