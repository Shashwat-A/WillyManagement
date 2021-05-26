import * as React from 'react';
import {View, Text, TouchableOpacity, StyleSheet , Image, TextInput} from 'react-native'
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner'

export default class TransactionScreen extends React.Component {
  constructor() {
    super();

    this.state = {
      hasCameraPermissions: null,
      scanned: false,
      scannedData: '',
      bnState: 'normal',
      scannedStudentId: '',
      scannedBookId: '',
    }
  }

  getCameraPermission = async (id) => {
    const {status} = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
      hasCameraPermissions: status==='granted',
      bnState: id,
      scanned: false
    })
  }

  handleBarcodeScan = async(type, data) => {
    const {bnState} = this.state

    if(bnState === "Book Id") {
      this.setState({
        scanned:true,
        scannedBookId: type.data,
        bnState: 'normal'
      }) 
    } else if(bnState === "Student Id") {
        this.setState({
          scanned:true,
          scannedStudentId: type.data,
          bnState: 'normal'
        }) 
    }
  }

  render() {
    const hasCameraPermissions = this.state.hasCameraPermissions
    const scanned = this.state.scanned
    const bnState = this.state.bnState
    console.log(scanned)
    
    if(bnState != 'normal' && hasCameraPermissions) {
      return(
        <BarCodeScanner 
          onBarCodeScanned = {scanned ? undefined : this.handleBarcodeScan}
          style = {StyleSheet.absoluteFillObject}
        />
      )
    } else if(bnState === 'normal' ) {
      return(
      <View style={styles.container}>
        <View>
            <Image source={require("../assets/booklogo.jpg")} style={{width: 200, height:200}}/>
            <Text style={{textAlign: 'center', fontSize: 30}}>Willy Management</Text>
        </View>

        <View style={styles.inpView}>
          <TextInput 
            style={styles.inputBx}
            placeholder= "Book Id"
            value={this.state.scannedBookId}
          />

          <TouchableOpacity 
            style={styles.scanBn}
            onPress={() => {
              this.getCameraPermission("Book Id")
            }}
          >
            <Text style={styles.bnText}>Scan</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inpView}>
        <TextInput
            style={styles.inputBx}
            placeholder= "Student Id"
            value={this.state.scannedStudentId}
          />

        <TouchableOpacity 
          style={styles.scanBn}
          onPress={() => {
            this.getCameraPermission("Student Id")
          }}
        >
            <Text style={styles.bnText}>Scan</Text>
        </TouchableOpacity>
        </View>
      </View>
    )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  scanBn: {
    backgroundColor: 'yellow',
    borderLeftWidth: 0,
    width: 50,
    borderWidth: 1.5,
  },

  bnText: {
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center'
  },

  inputBx: {
    width: 200,
    height: 40,
    borderWidth: 1.5,
    borderRightWidth: 0,
    fontSize: 20
  },

  inpView: {
    flexDirection: 'row',
    margin: 20,
  }
})