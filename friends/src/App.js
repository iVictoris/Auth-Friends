import React, { useState, useEffect, createContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  NavLink
} from "react-router-dom";
import { withFormik, Field, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";

import Axios from "axios";

/**
 *
 * *todo: add route to login
 * *todo: make login component
 *    *todo: receive token and use LocalStorage to save token
 *    *todo: history push to friends list
 *
 * *todo: create privateRoute
 *    *todo: check local storage for token
 *      *todo: if no token send to login
 * *todo: create protected route
 *    *todo: if not logged in redirect to login
 *
 * *todo: make FriendsList component
 *    *todo: render inside protectedRoute
 *    *todo: render friends given from api
 *
 * *todo: create addFriends form
 *    *todo: send post with data
 *    *todo: data shape {id, name, age, email}
 */

const withAxiosAuth = () => {
  const token = localStorage.getItem("token");
  return Axios.create({
    headers: {
      "Content-type": "application/json",
      Authorization: `${token}`
    }
  });
};

function App(props) {
  const token = localStorage.getItem("token");
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  useEffect(() => {
    setIsLoggedIn(!!token)
  }, [token]);
  return (
    <Router>
      <div className="App">
        {/* TODO: add route to login */}
        <nav className="navigation">
          {!isLoggedIn && (
            <NavLink to="/login" className="navigation-link">
              Login
            </NavLink>
          )}
          <NavLink to="/friends" className="navigation-link">
            Friends
          </NavLink>
          {isLoggedIn && (
            <NavLink to="/add" className="navigation-link">
              Add Friend
            </NavLink>
          )}

          {isLoggedIn && (
            <NavLink
              to="/login"
              className="navigation-link"
              onClick={() => {
                localStorage.removeItem("token");
              }}
            >
              Logout
            </NavLink>
          )}
        </nav>

        <Route path="/login" component={FormikLoginForm} />
        <PrivateRoute path="/friends" component={FriendsList} />
        <PrivateRoute path="/add" component={FormikAddFriendForm} />
      </div>
    </Router>
  );
}

const PrivateRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => {
        const token = localStorage.getItem("token");
        return token ? (
          <Component {...props} token={token} />
        ) : (
          <Redirect to="/login" />
        );
      }}
    />
  );
};

const FriendsList = () => {
  const friendsPath = "http://localhost:5000/api/friends";
  const [friends, setFriends] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const promise = withAxiosAuth().get(friendsPath);
      const response = await promise;
      setFriends(response.data);
    };
    fetchData();
  }, []);
  const friendsList = friends.map(({ name, age, email, id }) => (
    <section className="friend" key={id} id={id}>
      <section className="friend-name">
        <p>{name}</p>
      </section>
      <section className="friend-info">
        <section className="friend-age">
          <span>Age:</span> <span>{age}</span>
        </section>
        <section className="friend-email">
          <span>Email:</span> <span>{email}</span>
        </section>
      </section>
    </section>
  ));
  return (
    <section className="friends">
      <h3>Friends</h3>
      {!!friends.length && (
        <section className="friends-list">{friendsList}</section>
      )}
    </section>
  );
};

const loginForm = props => {
  return (
    <section className="login-form">
      <Form>
        <h3>Login</h3>
        <Field type="text" name="username" placeholder="Username" />
        <Field type="password" name="password" placeholder="Password" />
        <button type="submit">Login</button>
      </Form>
    </section>
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

  async handleSubmit({ username, password }, { props }) {
    const user = {
      username,
      password
    };

    const loginPath = `http://localhost:5000/api/login`;

    const promise = axios.post(loginPath, user);
    const { data } = await promise;
    localStorage.setItem("token", data.payload);
    props.history.push("/friends");
  }
})(loginForm);

const AddForm = props => {
  return (
    <section className="add-form">
      <Form>
        <h3>Add</h3>
        <Field type="text" name="name" placeholder="Name" />
        <Field type="text" name="age" placeholder="Age" />
        <Field type="text" name="email" placeholder="Email" />
        <button type="submit">Add Friend</button>
      </Form>
    </section>
  );
};

const FormikAddFriendForm = withFormik({
  mapPropsToValues({ name, age, email }) {
    return {
      name: name || "",
      age: age || "",
      email: email || ""
    };
  },

  validateYupSchema: Yup.object().shape({
    name: Yup.string().required("Name is required to submit form"),
    age: Yup.string().required("Age is required to submit form"),
    email: Yup.string().required("Email is required to submit form")
  }),

  async handleSubmit({ name, age, email }, { props }) {
    const user = {
      name,
      age,
      email
    };

    const addPath = `http://localhost:5000/api/friends`;

    await withAxiosAuth().post(addPath, user);
    props.history.push("/friends");
  }
})(AddForm);

export default App;
