import * as React from 'react';
import {View, Text, TouchableOpacity , TextInput, FlatList, StyleSheet} from 'react-native'
import db from '../config';
import firebase from 'firebase';

export default class SearchScreen extends React.Component {
  constructor () {
    super();

    this.state = {
      search: '',
      allTransactions: [],
      lastVisibleTransaction: null,
    }
  }

  searchTransaction = async(search) => {
    var enteredText = search.split("");
    var text = search.toUpperCase();

    if(enteredText[0].toUpperCase() === 'B') {
      const transaction = await db.collection("transactions").where("bookId", "==", text.toLowerCase()).get();
      transaction.docs.map(doc => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc
        })
      })
    } else if(enteredText[0].toUpperCase() === 'S') {
      const transaction = await db.collection("transactions").where("studentId", "==", text.toLowerCase()).get();
      transaction.docs.map(doc => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc
        })
      })
    }
  }

  componentDidMount = async() => {
    const query = await db.collection("transactions").limit(10).get();

    query.docs.map(doc => {
      this.setState({
        allTransactions: [],
        lastVisibleTransaction: doc
      })
    })
  }

  fetchMoreTransactions = async() => {
    var text = this.state.search.toUpperCase()
    var enteredText = text.split("");

    if(enteredText[0].toUpperCase() === 'B') {
      const transaction = await db.collection("transactions").where("bookId", "==", text.toLowerCase()).startAfter(this.state.lastVisibleTransaction).limit(10).get();
      transaction.docs.map(doc => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc
        })
      })
    } else if(enteredText[0].toUpperCase() === 'S') {
      const transaction = await db.collection("transactions").where("studentId", "==", text.toLowerCase()).startAfter(this.state.lastVisibleTransaction).limit(10).get();
      transaction.docs.map(doc => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc
        })
      })
    }
  }

  render() {
    return(
      <View style={styles.container}>
        <View style={styles.searchView}>
        <TextInput 
          style={styles.searchBar}
          placeholder= "Enter Book Id or Student Id"
          onChangeText = {text => {
            this.setState({
              search: text
            })
          }}
        />

          <TouchableOpacity style={styles.searchBn} onPress={() => {this.searchTransaction(this.state.search)}}>
            <Text>Search</Text>
          </TouchableOpacity>
        </View>

          <FlatList
            data={this.state.allTransactions}
            renderItem={({item}) => (
              <View style={{borderBottomWidth: 2}}>
                <Text>{"Book Id: " + item.bookId}</Text>
                <Text>{"Student Id: " + item.studentId}</Text>
                <Text>{"Transaction Type: " + item.transactionType}</Text>
                <Text>{"Date: " + item.date.toDate()}</Text>
              </View>
            )}

            keyExtractor={(item, index) => index.toString()}

            onEndReached = {this.fetchMoreTransactions}

            onEndReachedThreshold={0.7}
          />
      </View>                          
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },

  searchView: {
    flexDirection: 'row',
    height: 40,
    width: 'auto',
    borderWidth: 1,
    alignItems: 'center'
  },

  searchBar: {
    borderWidth: 2,
    height: 30,
    width: 300,
    paddingLeft: 10
  },

  searchBn: {
    borderWidth: 1,
    height: 30,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'yellow',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 20,
    alignItems: 'center'
  }
})