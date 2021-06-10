import * as React from 'react';
import {View, Text, TouchableOpacity , TextInput, FlatList, StyleSheet, Image, KeyboardAvoidingView} from 'react-native'

export default class LoginScreen extends React.Component {

    constructor() {
        super();

        this.state={
            emailId: '',
            password:'',
        }
    }

    login = async(email, password) => {
        if(email && password) {
           try{
               const response = await firebase.auth().signInWithEmailAndPassword(email, password);
               if(response) {
                   this.props.navigation.navigate('TransactionScreen')
               }
           }
           
           catch(error){
                switch(error.code) {
                    case 'auth/user-not-found' : 
                    alert('User Not Found')

                    break;

                    case 'auth/invalid-email' :
                    alert('Incorrect email or password')
                }
           }
        } else {
            alert('Please Enter Email and Password')
        }
    }

    render() {
        return(
            <KeyboardAvoidingView style={{alignItems: 'center', justifyContent: 'cednter', marginTop: 20, flex: 1}}>
                <View>
                    <Image
                        source={require("../assets/booklogo.jpg")}
                        style={{width: 200, height:200}}
                    />
                </View>

                <View>
                    <TextInput
                        style={styles.loginbx}
                        placeholder='Enter Email Address Here'
                        keyboardType='email-address'
                        onChangeText={(text)=>{
                            this.setState({
                                emailId: text
                            })
                        }}
                    />

                    <TextInput
                        style={styles.loginbx}
                        placeholder='Enter Passwaord Here'
                        secureTextEntry={true}
                        onChangeText={(text)=>{
                            this.setState({
                                password: text
                            })
                        }}
                    />
                </View>

                <View>
                    <TouchableOpacity style={{height: 30, width:90, borderWidth: 1, marginTop: 20, paddingTop: 5, justifyContent: 'center', borderRadius: 8}}>
                        <Text style={{textAlign: 'center'}}>Login</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        )
    }
}

const styles = StyleSheet.create({
    loginBx: {
        width: 300,
        height: 40,
        borderWidth: 1,
        fontSize: 20,
        margin: 15,
        paddingLeft: 10
    }
})