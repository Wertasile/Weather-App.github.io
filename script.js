var latitude = 13.0878
var longitude = 80.2785

//-----------------------------------------------------------------------SEARCH FUNCTIONALITY---------------------------------------------------------------------------------------------//
const searchbox = document.querySelector(".search input")
const searchbtn = document.querySelector(".btn")
searchbtn.addEventListener('click',() => {
    console.log(searchbox.value)
    getcoord(searchbox.value)
    const x = document.getElementsByClassName("search-results")
    x[0].classList.add('unhide')
})
async function getcoord(searchbox){
    const locationresponse = await fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + searchbox + "&count=10&language=en&format=json")
    const locationdata = await locationresponse.json()
    console.log(locationdata)
    
    for(let i=0;i<locationdata.results.length;i++){
        const searchresults = document.getElementsByClassName("search-results")
        const div = document.createElement('div')
        div.innerHTML = locationdata.results[i].name + " , " + locationdata.results[i].admin1 + " , " + locationdata.results[i].country
        searchresults[0].append(div)
        div.addEventListener('click',() => {
            console.log(locationdata.results[i].latitude + " / " + locationdata.results[i].longitude)
            latitude = locationdata.results[i].latitude
            longitude = locationdata.results[i].longitude
            hourgrid = document.getElementsByClassName('hourly-grid')
            hourgrid[0].innerHTML = ''
            getWeather(latitude,longitude)
            searchresults[0].classList.remove('unhide')
            searchresults[0].innerHTML = ''
            
        })
    }
}

//------------------------------------------------------------------------ACQUIRING WEATHER DATA--------------------------------------------------------------------------------------------//

async function getWeather(lat,long){

    
    const weatherresponse = await fetch("https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + long + "&hourly=temperature_2m,relativehumidity_2m,weathercode,visibility,windspeed_10m,is_day&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum&current_weather=true&timezone=auto")
    const data = await weatherresponse.json()

    console.log(data)

    const airquality = await fetch("https://air-quality-api.open-meteo.com/v1/air-quality?latitude=" + lat + "&longitude=" + long + "&hourly=pm2_5,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index&timezone=auto")
    const data2 = await airquality.json()
    
    console.log(data2)

    // document.getElementsByClassName("city")[0].innerHTML = data.name
    
    document.getElementsByClassName("temp")[0].innerHTML = "<h2>" + data.current_weather.temperature + "°c" + "</h2>"
    // document.getElementsByClassName("wind-speed")[0].innerHTML = "<h3>" + data.current_weather.windspeed + "km/h" + "</h3>"
    const currentweathercode =  data.current_weather.weathercode
    const currentweatherclass = "currentimg"
    
    

    const datetime = data.current_weather.time                                //acquiring date and time from object
    
    var date = ''
    for(i in datetime){
        if (datetime[i]=="T"){
            break
        }
        date += datetime[i]
        console.log(date)
        
    }

    let timeofday = data.current_weather.is_day
    const body = document.querySelector("body")
    if (timeofday=="1"){
        
        // body.style.backgroundImage = "url('weather-symbols/dayimg.webp')"
        body.style.backgroundColor = "#4797E7" 
    }else if(timeofday=="0"){
        body.style.backgroundColor = "#2A4891"
    }

    acquireweatherimg(currentweathercode,currentweatherclass,0,timeofday)
    let time = datetime.match(/\d\d:\d\d/);
    document.getElementsByClassName("time")[0].innerHTML = "<h2>Last Updated: " + time  + "</h2>"
    
    
    const maxtemparray = data.daily.temperature_2m_max
    const mintemparray = data.daily.temperature_2m_min
    const codearray = data.daily.weathercode
    const daydate = data.daily.time
    for(let i=0;i<7;i++){
       
        acquireweatherimg(codearray[i],"dayimg",i,timeofday)
        document.getElementsByClassName("daytemp")[i].innerHTML = Math.round(maxtemparray[i]) + "°c"  + " / " + Math.round(mintemparray[i]) + "°c" 
        document.getElementsByClassName("daydate")[i].innerHTML = daydate[i]
    }

    //-----------------------------------------------------------------MAIN-BLOCK RIGHT SIDE----------------------------------------------------------------//

    const sunrise = data.daily.sunrise[0]                                                       //sunrise- sunset
    const sunset = data.daily.sunset[0]
    document.getElementById('sunrise').innerHTML = sunrise.match(/\d\d:\d\d/)
    document.getElementById('sunset').innerHTML = sunset.match(/\d\d:\d\d/)

    const datetime2 = data2.hourly.time                                                                      
    let time1 = String(datetime.match(/\d\d:/))
    for(let i=0;i<24;i++){                                                                      //air quality
        console.log("bruh")
        if (time1 == datetime2[i].match(/\d\d:/)){
            document.getElementById('pm2.5').innerHTML = (data2.hourly.pm2_5[i])
            document.getElementById('so2').innerHTML = (data2.hourly.sulphur_dioxide[i])
            document.getElementById('o3').innerHTML = (data2.hourly.ozone[i])
            document.getElementById('no2').innerHTML = (data2.hourly.nitrogen_dioxide[i] + "")
            document.getElementById('humidity').innerHTML = (data.hourly.relativehumidity_2m[i] + "%")
            document.getElementById('visibility').innerHTML = (data.hourly.visibility[i] + "m")
            // document.getElementById('pressure').innerHTML = (data.hourly.pressure[i])
            document.getElementById('wind-speed').innerHTML = (data.current_weather.windspeed + "km/h")
        } 
    }

    for(let i=0;i<24;i++){
        const hourlygrid = document.querySelector('.hourly-grid')
        
        const hour = document.createElement('div')
        const houritem1 = document.createElement('div')
        const houritem2 = document.createElement('div')
        const houritem3 = document.createElement('div')
        const houritem4 = document.createElement('img')
        houritem4.classList.add("hourimage")

        const hourtime = data.hourly.time[i]
        let Time = hourtime.match(/\d\d:\d\d/);
        houritem1.innerHTML = Time

        houritem2.innerHTML = Math.round(data.hourly.temperature_2m[i])+ "°c"
        houritem3.innerHTML = data.hourly.windspeed_10m[i]+ "km/h"
        
        
        hour.append(houritem1)
        hour.append(houritem2)
        hour.append(houritem3)
        hour.append(houritem4)
        hour.classList.add('hour')
        hourlygrid.appendChild(hour)
    }

    for(let i=0;i<24;i++){
        const wcode = data.hourly.weathercode[i]
        const dorn = data.hourly.is_day[i]
        acquireweatherimg(wcode,"hourimage",i,dorn)
    }

    
    
}

getWeather(latitude,longitude)

function acquireweatherimg(code,clas,i,tod) {
    if (code==0 && tod==1){
        const x = document.getElementsByClassName(clas)[i]
        x.setAttribute('src', "weather-symbols/1530392_weather_sun_sunny_temperature_icon.png");
    }
    else if(code==0 && tod==0){
        const x = document.getElementsByClassName(clas)[i]
        x.setAttribute('src', "weather-symbols/moon.png");
    }
    else if(code==3 || code==2 || code==1 & tod==1){
        const x=document.getElementsByClassName(clas)[i]
        x.setAttribute('src', "weather-symbols/2995001_cloud_cloudy_sun_weather_summer_icon.png");
    }
    else if(code==3 || code==2 || code==1 & tod==0){
        const x=document.getElementsByClassName(clas)[i]
        x.setAttribute('src', "weather-symbols/cloudy-night.png");
    }
    else if(code==45 || code==48){
        const x=document.getElementsByClassName(clas)[i]
        x.setAttribute('src', "weather-symbols/1530368_weather_clouds_cloudy_fog_foggy_icon.png");
    }
    else if(code==51 || code==53 || code==55 || code==56 || code==57 ){
        const x=document.getElementsByClassName(clas)[i]
        x.setAttribute('src', "weather-symbols/4102316_cloud_drizzle_rain_weather_icon.png");
    }
    else if(code==61 || code==63 || code==65 || code==80 || code==81 || code==82){
        const x=document.getElementsByClassName(clas)[i]
        x.setAttribute('src', "weather-symbols/4102320_cloud_heavy rain_rain_weather_icon.png");
    }
    else if(code==66 || code==67){
        const x=document.getElementsByClassName(clas)[i]
        x.setAttribute('src', "weather-symbols/freezing-rain.png");
    }
    else if(code==85 || code==86){
        const x=document.getElementsByClassName(clas)[i]
        x.setAttribute('src', "weather-symbols/4908719_cold_protection_season_snow_snowfall_icon.png");
    }
    else if(code==95){
        const x=document.getElementsByClassName(clas)[i]
        x.setAttribute('src', "weather-symbols/9628808_cloud_thunder_thunderstorm_rain_weather_icon.png");
    }
    else if(code==96 || code==99){
        const x=document.getElementsByClassName(clas)[i]
        x.setAttribute('src', "weather-symbols/4102318_cloud_heavy rain_rain_storm_thunderbolt_icon.png");
    }
    
}



