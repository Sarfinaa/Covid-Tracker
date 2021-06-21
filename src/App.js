import React, { useState, useEffect } from "react";
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import LineGraph from './LineGraph';
import './App.css';
import { sortData } from './util';
import 'leaflet/dist/leaflet.css'
import {prettyPrintStat} from './util';

import {
  FormControl,
  Select,
  MenuItem,
  Card,
  CardContent,
  Button
} from "@material-ui/core";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries,setMapCountries]=useState([]);
  const [casesType,setCasesType]=useState("cases");
  const[darkMode,setDarkMode]=useState(false);
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all").then(res => res.json()).then(data => {
      setCountryInfo(data);
    });
  }, [])
  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries").then(res => res.json())
        .then(data => {
          const countries = data.map(country => ({

            name: country.country,
            value: country.countryInfo.iso2
          }));
          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
        });
    };
    getCountriesData();
  }, []);

  const onCountryChange = (event) => {
    const countryCode = event.target.value;

    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' :
      `https://disease.sh/v3/covid-19/countries/${countryCode}`

    const info = async () => {
      await fetch(url).then(res => res.json()).then(data => {
        setCountry(countryCode);
        setCountryInfo(data);
setMapCenter([data.countryInfo.lat,data.countryInfo.long]);
setMapZoom(4);     
});
    };
    info();
  };

  const onDark=()=>{
    setDarkMode((prevmode)=>!prevmode);
  }
  return (
    <div className={`app ${darkMode?'onDarkMode':'offDarkMode'}`}>
      <div className="app__left">
        <div className="app__header">

          <h1>COVID-19 TRACKER</h1>
          <Button variant="outlined" className={`${darkMode?'darkShadow':''}`} onClick={onDark}>Dark Mode</Button>
          <FormControl className={` app__dropdown ${darkMode?'darkShadow':''}`}>
            <Select variant="outlined" onChange={onCountryChange} value={country}>
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {
                countries.map(country => <MenuItem value={country.value}>{country.name}</MenuItem>)
              }

            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox isRed={true} darkMode={darkMode}
          active={casesType==='cases'} 
          onClick={e=>setCasesType('cases')}
          title="Coronavirus cases" cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)}></InfoBox>
          <InfoBox darkMode={darkMode} active={casesType==='recovered'}
          onClick={e=>setCasesType('recovered')} 
          title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)}></InfoBox>
          <InfoBox darkMode={darkMode} isRed={true} 
           active={casesType==='deaths'}
          onClick={e=>setCasesType('deaths')}
          title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)}></InfoBox>
        </div>
        <Map darkMode={darkMode} casesType={casesType} center={mapCenter}
          zoom={mapZoom} 
          countries={mapCountries}/>
      </div>
      <Card className={`app__right ${darkMode && 'darkShadow'}`}> 
        <CardContent>
          <h3>Live Cases By Country</h3>
          <Table countries={tableData} />
          <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>
      </Card>

    </div>
  );
}

export default App;
