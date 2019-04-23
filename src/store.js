/* eslint-disable */
import Vue from 'vue'
import Vuex from 'vuex'

import router from './routes'

Vue.use(Vuex);

const FbAuth = "https://www.googleapis.com/identitytoolkit/v3/relyingparty"
const FbApiKey = "AIzaSyCHM60b1pGjuSHfK-lfx8CNeNjcXtwpkQU"

export default new Vuex.Store({
  state: {
    email: '',
    token: '',
    refresh: '',
    user: {}
  },
  getters: {
    isAuth(state){
      return state.token ? true : false;
    }

  },
  mutations: {
    auth(state, authData) {
      state.email = authData.email;
      state.token = authData.idToken;
      state.refresh = authData.refreshToken
      router.push('/')
    },
    logout(state){
      state.email='';
      state.token= '';
      state.refresh= '';
      localStorage.removeItem("token")
      localStorage.removeItem("refresh")
      router.push('/')
    },
    addUserInfo(state,userInfo){
      state.user = userInfo
    }

  },
  actions: {
    signin({ commit }, payload) {
      Vue.http.post(`${FbAuth}/verifyPassword?key=${FbApiKey}`, {
        ...payload,
        returnSecureToken: true
      })
        .then(res => res.json())
        .then(authData => {
          commit("auth", authData)
          localStorage.setItem("token", authData.idToken)
          localStorage.setItem("refresh", authData.refreshToken)
          
        })
    },
    signup({ commit }, payload) {
      Vue.http.post(`${FbAuth}/signupNewUser?key=${FbApiKey}`, {
        ...payload,
        returnSecureToken: true,
      })
        .then(response => response.json())
        .then(authData => {
          commit("auth", authData)
          localStorage.setItem("token", authData.idToken)
          localStorage.setItem("refresh", authData.refreshToken)
          console.log(authData)
        })
        .catch(err => {
          console.log(err)
        })
    },
    logout({commit}){
      commit("logout")
    },
    refreshToken({commit}){
       const refreshToken=localStorage.getItem("refresh")
       if(refreshToken){
         Vue.http.post(`https://securetoken.googleapis.com/v1/token?key=${FbApiKey}`,{
           grant_type: 'refresh_token',
           refresh_token:refreshToken
         })
         .then( res=> res.json())
         .then( authData => {
           console.log(authData)
           commit("auth",{
             idToken:authData.id_token,
             refreshToken: authData.refresh_token
           })
         })
       }
    },
    getUserInfo({commit},payload){
      Vue.http.post(`https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${FbApiKey}`,{
        idToken: payload
      })
      .then(res=>res.json())
      .then(response=>{
        console.log(response)
        commit("addUserInfo",response.users[0])
      })
    }
  }
})