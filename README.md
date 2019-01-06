# Refugee Resettlement Visualization from 2008-2017
This visualization is designed to show movement and trend of refugee resettlement between countries of origin and countries of resettlement during the past decade. The dataset we chose to use is the Resettlement Population Statistics from UNHCR.
## Authors: 
Yingying Wang, Claudia Naughton
11/19/17, CS314 final project Carleton College

##### Data sources: 
Refugee data is sourced from the UNHCR data at http://popstats.unhcr.org/en/resettlement. The variables included in the visualization are years (2008 - 2017), countries of origin, and countries of asylum. The json file used to create country paths was sourced from https://geojson-maps.ash.ms/.

##### How to run: 
While in the directory that contains the map files, run 'python3 -m http.server', then navigate to localhost:8000 in a web browser. Select map.html to view. The overall data for the year 2017 will initially be displayed. You can switch between maps using the buttons at the top of the screen. 


##### Files contained in this directory:
map.js
map.html
default.csv - data used in "Overall Trend" map
rawdata.csv - data used for ""By Country of Origin" and "By Country of Resettlement" maps
custom.geo.json- json file for country shapes
finalProjectWriteUp - a pdf contains descriptions and screenshots of our visualizations
