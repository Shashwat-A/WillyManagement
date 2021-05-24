import * as React from 'react';
import {View, Text, TouchableOpacity, StyleSheet , Image} from 'react-native'
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner'

export default class TransactionScreen extends React.Component {
  constructor() {
    super();

    this.state = {
      hasCameraPermissions: null,
      scanned: false,
      scannedData: '',
      bnState: 'normal'
    }
  }

  getCameraPermission = async () => {
    const {status} = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
      hasCameraPermissions: status==='granted',
      bnState: 'clicked',
      scanned: false
    })
  }

  handleBarcodeScan = async(type, data) => {
    this.setState({
      scanned:true,
      scannedData: data,
      bnState: 'normal'
    })
  }

  render() {
    const hasCameraPermissions = this.state.hasCameraPermissions
    const scanned = this.state.scanned
    const bnState = this.state.bnState
    
    if(bnState === 'clicked' && hasCameraPermissions) {
      return(
        <BarCodeScanner 
          onBarCodeScanned = {scanned ? undefined : this.handleBarcodeScan}
          style = {StyleSheet.absoluteFillObject}
        />
      )
    } else if(bnState === 'normal') {
      return(
      <View style={style.container}>
        <View>
            <Image source={require("../assets/booklogo.jpg")} style={{width: 200, height:200}}/>
            <Text style={{textAlign: 'center', fontSize: 30}}>Willy Management</Text>
        </View>
      </View>
    )
    }
  }
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  scanBn: {
    backgroundColor: 'yellow',
    padding: 10,
    margin: 10,
    borderWidth: 4,
  },

  bnText: {
    fontSize: 18,
    fontWeight: 'bold',
  }
})