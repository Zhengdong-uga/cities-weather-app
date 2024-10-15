import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

export default function App() {
  //states
  const [city, setCity] = useState('Tokyo'); //default location in search bar set to Tokyo
  const [cities, setCities] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  //Five cities are displayed by default when the app runs.
  const defaultCities = ['Ann Arbor', 'Atlanta', 'Shanghai', 'Dubai', 'New York'];

  useEffect(() => {
    defaultCities.forEach(city => fetchWeather(city)); }, []);

  //getWeatherIcon function
  const getWeatherIcon = (condition) => {
    if (condition.includes('cloud')) {
      return 'cloudy'; // Ionicons cloudy icon
    } else if (condition.includes('sun') || condition.includes('clear')) {
      return 'sunny'; // Ionicons sunny icon
    } else if (condition.includes('rain')) {
      return 'rainy'; // Ionicons rainy icon
    } else if (condition.includes('snow')) {
      return 'snow'; // Ionicons snow icon
    } else {
      return 'help-circle-outline'; // for other conditions
    }
  };

  //fetch weather data
  const fetchWeather = (cityName, isRefresh = false) => {
    const params = new URLSearchParams();
    params.set('q', cityName);  //city name as query
    params.set('units', 'imperial');   // Fahrenheit as unit
    params.set('appid', '9cef6e5bf8e6cbadadd442a24188eab6');  //APIKey
    
    fetch(`https://api.openweathermap.org/data/2.5/weather?${params.toString()}`)
      .then(response => response.json())
      .then(json => {
        let cityData;
        if (json.cod === "404") {
          // Handle invalid city (not found)
          cityData = {
            key: cityName,
            temp: '??',
            condition: 'City not found',
          };
        } else {
          // Handle valid city
          let newTemp = Math.round(json.main.temp);//round the temp number to make it looks consistent
          let newCondition = json.weather[0].description;
  
          cityData = {
            key: cityName,
            temp: newTemp,
            condition: newCondition,
          };
        }
  
        // Now check if the city already exists in the list to aviod unnecessary duplication 
        setCities((prevCities) => {
          const cityIndex = prevCities.findIndex(c => c.key.toLowerCase() === cityName.toLowerCase());
  
          if (cityIndex > -1) {
            // City exists, update it
            const updatedCities = [...prevCities];
            updatedCities[cityIndex] = cityData;
            return updatedCities;
          } else if (!isRefresh) {
            // If it's not a refresh, add the new city (this covers adding a city)
            return [...prevCities, cityData];
          } else {
            return prevCities; // For refresh, don't add new cities
          }
        });
      })
      .catch(error => {
        console.error("Error fetching weather data:", error);
      });
  };

  //addCity function
  const addCity = () => {
    if (city.length > 0) {
      fetchWeather(city); // Fetch the weather data for the city
      setCity(''); // Clear the input field
    }
  };
  
  //refresh
  const refreshWeather = () => {
    cities.forEach(city => fetchWeather(city.key)); // Refresh weather for all cities
    const now = new Date();
    setLastUpdated(now.toLocaleString());
  };

  //CityItem custom component
  const CityItem = ({ cityName, temp, icon }) => (
    <View style={styles.cityRow}>
      <Text style={styles.cityName}>{cityName}</Text>
      <Text style={styles.cityTemp}>{temp} °F</Text>
      <Ionicons name={icon} size={24} color="#00274C" style={styles.weatherIcon} />
    </View>
  );
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Channel 669 Weather</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter city name"
          value={city}
          onChangeText={setCity}
        />

        {/* add button */}
        <TouchableOpacity style={styles.addButton} onPress={addCity}>
          <Ionicons name="add" size={24} color="#00274C" /> 
        </TouchableOpacity>

      </View>

      <FlatList
            data={cities}
            renderItem={({ item }) => (
              <CityItem 
                cityName={item.key} 
                temp={item.temp} 
                icon={getWeatherIcon(item.condition)} 
              />
        )}
        keyExtractor={(item) => item.key}
      />


      {/* Refresh button and updated text container */}
      <View style={styles.refreshContainer}>
        <TouchableOpacity style={styles.refreshButton} onPress={refreshWeather}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
        {lastUpdated && <Text style={styles.updatedText}>Last updated: {lastUpdated}</Text>}
      </View>

    </View>
  );
}
  


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F0F0',
  },
  headerContainer: {
    backgroundColor: '#00274C', // Dark blue background for the header
    padding: 40,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 50,
  },
  
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFCB05',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderColor: '#CCC',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#FFF',
  },

  addButton: {
    backgroundColor: '#FFCB05', // Maize background
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginLeft: 10,
  },

  cityRow: {
    flexDirection: 'row', // Arrange items horizontally
    alignItems: 'center', // Center items vertically
    justifyContent: 'space-between', // Even spacing between items
    padding: 10,
    borderBottomColor: '#CCC',
    borderBottomWidth: 1,
  },

  cityName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 2, // Take up more space
  },

  cityTemp: {
    fontSize: 16,
    marginHorizontal: 10,
    flex: 1, 
  },

  weatherIcon: {
    flex: 1, // Ensure icon stays on the right
    textAlign: 'right', // Align the icon to the right
  },
  
  refreshContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 60,
  },
  refreshButton: {
    backgroundColor: '#FFCB05',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  refreshText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00274C',
  },
  updatedText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});