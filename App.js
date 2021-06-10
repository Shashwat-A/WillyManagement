import * as React from 'react';
import { Text, View, StyleSheet , Image } from 'react-native';
import Constants from 'expo-constants';
import {createAppContainer, createSwitchNavigator} from 'react-navigation'
import {createBottomTabNavigator} from 'react-navigation-tabs'
import TransactionScreen from './Screens/TransactionScreen';
import SearchScreen from './Screens/SearchScreen';
import LoginScreen from './Screens/LoginSreen';

export default class App extends React.Component {
  render() {
    return(
      <AppContainer/>
    )
  }
}

const tabNavigator = createBottomTabNavigator({
  Transaction: {screen: TransactionScreen},
  Search : {screen: SearchScreen}
}, 
{
  defaultNavigationOptions: ({navigation}) => ({
    tabBarIcon: ()=> {
      const nameRoot = navigation.state.routeName;
      if(nameRoot === "Transaction") {
        return(
          <Image source = {require("./assets/book.png")} style={{width: 40, height: 40}}/>
        )
      } else if(nameRoot === 'Search') {
        return(
          <Image source={require("./assets/searchingbook.png")} style={{width: 40, height: 40}}/>
        )
      }
    }
  })
}
)

const switchNavigator = createSwitchNavigator({
  LoginScreen : {screen: LoginScreen},
  tabNavigator: {screen: tabNavigator}
})

const AppContainer = createAppContainer(switchNavigator)