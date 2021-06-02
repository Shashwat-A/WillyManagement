import * as React from 'react';
import {View, Text, TouchableOpacity, StyleSheet , Image, TextInput , KeyboardAvoidingView , ToastAndroid} from 'react-native'
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner'
import db from '../config';
import firebase from 'firebase';

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
      transactionMessage: '',
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

  initiateBookIssue = async() => {
    db.collection("transactions").add({
      bookId : this.state.scannedBookId,
      studentId : this.state.scannedStudentId,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: "Issue"
    })

    db.collection("books").doc(this.state.scannedBookId).update({
      bookAvailability: false
    })

    db.collection("students").doc(this.state.scannedStudentId).update({
      numberOfBooksIssued: firebase.firestore.FieldValue.increment(1),
    })

    ToastAndroid.show("Book Issued", ToastAndroid.SHORT)

    this.setState({
      scannedBookId: '',
      scannedStudentId: '',
    })
  }

  initiateBookReturn = async() => {
    db.collection("transactions").add({
      bookId : this.state.scannedBookId,
      studentId : this.state.scannedStudentId,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: "Return"
    })

    db.collection("books").doc(this.state.scannedBookId).update({
      bookAvailability: true
    })

    db.collection("students").doc(this.state.scannedStudentId).update({
      numberOfBooksIssued: firebase.firestore.FieldValue.increment(-1),
    })

    ToastAndroid.show("Book Returned", ToastAndroid.SHORT)

    this.setState({
      scannedBookId: '',
      scannedStudentId: '',
    })
  }

  handleTransaction = async() => {
    var transactionMessage = null;
    db.collection("books").doc(this.state.scannedBookId).get()
    .then((doc) => {
      var book = doc.data()
      if(book.bookAvailability) {
        this.initiateBookIssue();
        transactionMessage = 'BookIssued'
      } else {
        this.initiateBookReturn();
        transactionMessage = "BookReturned"
      }
    })

    this.setState({
      transactionMessage: transactionMessage
    })
  }

  render() {
    const hasCameraPermissions = this.state.hasCameraPermissions
    const scanned = this.state.scanned
    const bnState = this.state.bnState
    
    if(bnState != 'normal' && hasCameraPermissions) {
      return(
        <BarCodeScanner 
          onBarCodeScanned = {scanned ? undefined : this.handleBarcodeScan}
          style = {StyleSheet.absoluteFillObject}
        />
      )
    } else if(bnState === 'normal' ) {
      return(
      <KeyboardAvoidingView style = {styles.container} behavior="padding" enabled>
        <View>
            <Image source={require("../assets/booklogo.jpg")} style={{width: 200, height:200}}/>
            <Text style={{textAlign: 'center', fontSize: 30}}>Willy Management</Text>
        </View>

        <View style={styles.inpView}>
          <TextInput 
            style={styles.inputBx}
            placeholder= "Book Id"
            onChangeText= {(text) => {
              this.setState({
                scannedBookId: text
              })
            }}
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
            onChangeText= {(text) => {
              this.setState({
                scannedStudentId: text
              })
            }}
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

        <TouchableOpacity style={styles.subBn} 
        onPress={async () => {
          this.handleTransaction()
        }}>

          <Text style= {styles.subBnText}>Submit</Text>

        </TouchableOpacity>
      </KeyboardAvoidingView>
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

  subBn: {
    backgroundColor: 'pink',
    width: 100,
    height: 50,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  subBnText: {
    padding: 10,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold'
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