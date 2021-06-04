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

  checkStudentEligibilityForBookIssue = async()=> {
    const stuRef = await db.collection("students").where("studentId", "==", this.state.scannedStudentId).get()
    var isStudentEligible = '';

    if(stuRef.docs.length === 0) {
      isStudentEligible = false;
      
      alert("Student Id doesn't Exsist in the database")
    } else {
      stuRef.docs.map(doc => {
        var student = doc.data();
        if(student.numberOfBooksIssued < 2) {
          isStudentEligible = true
        } else {
          isStudentEligible = false;
          alert("Student Has already been issued two books")

        }
      })
    }

    this.setState({
      scannedBookId: '',
      scannedStudentId: '',
    })
    
    return(isStudentEligible)
  }

  checkStudentEligibilityForBookReturn = async() => {
    const transactionRef = await db.collection("transactions").where("bookId" , "==" , this.state.scannedBookId).limit(1).get()
    var isStudentEligible = '';

    transactionRef.docs.map(doc => {
      var lastBookTransaction = doc.data()
      if(lastBookTransaction.studentId === this.state.scannedStudentId) {
        isStudentEligible = true
      } else{
        isStudentEligible = false;
        alert("Book was not issued to this student")
      }
    })

    this.setState({
      scannedBookId: '',
      scannedStudentId: '',
    })

    return(isStudentEligible)
  }

  checkBookEligibility = async() => {
    const bookRef  = await db.collection("books").where("bookId", "==", this.state.scannedBookId).get();
    var isBookEligible = '';

    if(bookRef.docs.length === 0) {
      isBookEligible = false
    } else {
      bookRef.docs.map(doc => {
        var book = doc.data();
        if(book.bookAvailability) {
          isBookEligible = "Issue"
        } else {
          isBookEligible = "Return"
        }
      })
    }

    this.setState({
      scannedBookId: '',
      scannedStudentId: '',
    })
    
    return(isBookEligible)
  }

  checkStudentEligibility= async() => {
    const studentRef = await db.collection("students").where("studentId" , "==", this.state.scannedStudentId).get()
    var isStudentEligible = ""

    if(studentRef.docs.length === 0) {
      isStudentEligible = false;
      alert("Student Doesn't exsisit in the Database")
    } else{
      isStudentEligible = true
    }

    this.setState({
      scannedBookId: '',
      scannedStudentId: '',
    })

    return(isStudentEligible)
  }

  handleTransaction = async() => {
    var transactionType = await this.checkBookEligibility();
    var studentEligible = await this.checkStudentEligibility();
    if(!transactionType) {
      alert("Book doesn't exsist in the library")
      this.setState({
        scannedBookId: '',
        scannedStudentId: '',
      })
    } else if(!studentEligible) {
      alert("Student doesn't exsist in the Database")
      this.setState({
        scannedBookId: '',
        scannedStudentId: '',
      })
    }
    else if(transactionType === "Issue") {
      var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
      if(isStudentEligible) {
        this.initiateBookIssue()
      } 
    } else {
      var isStudentEligible = await this.checkStudentEligibilityForBookReturn();
      if(isStudentEligible) {
        this.initiateBookReturn();
      }
    }
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