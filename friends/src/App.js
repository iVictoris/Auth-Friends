import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { withFormik, Field, Form } from "formik";
import * as Yup from "yup";
import axios from 'axios';

import "./App.css";

/**
 *
 * todo: add route to login
 * todo: make login component
 *    todo: receive token and use LocalStorage to save token
 *    todo: history push to friends list
 *
 * todo: create privateRoute
 *    todo: check local storage for token
 *      todo: if no token send to login
 * todo: create protectedRoute
 *    todo: if not logged in redirect to login
 *
 * todo: make FriendsList component
 *    todo: render inside protectedRoute
 *    todo: render friends given from api
 *
 * todo: create addFriends form
 *    todo: send post with data
 *    todo: data shape {id, name, age, email}
 */

function App() {
  return (
    <Router>
      <div className="App">
        {/* TODO: add route to login */}
        <Route path="/login" component={FormikLoginForm} />
      </div>
    </Router>
  );
}

const loginForm = props => {
  return (
    <Form>
      <Field type="text" name="username" placeholder="Username" />
      <Field type="password" name="password" placeholder="Password" />
      <button type='submit'>Login</button>
    </Form>
  );
};

const FormikLoginForm = withFormik({
  mapPropsToValues({ username, password }) {
    return {
      username: username || "",
      password: password || ""
    };
  },

  validateYupSchema: Yup.object().shape({
    username: Yup.string().required("Username is required to submit form"),
    password: Yup.string().required("Password is required to submit form")
  }),

  async handleSubmit({ username, password }, formikBag) {
    const user = {
      username,
      password
    };

    const loginPath = `http://localhost:5000/api/login`

    const promise = axios.post(loginPath, user);
    const {data} = await promise;
    localStorage.setItem('token', data.payload);
  }
})(loginForm);

export default App;
