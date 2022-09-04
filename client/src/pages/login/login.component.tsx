import React, { useState } from "react";
import axios from "axios";
import { Form, Formik } from "formik";
import classes from "./login.module.scss";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { toast } from "react-toastify";
import InfoItem from "../../components/infoItem/infoItem.component";
import Button from "../../components/button/button.component";
import Avatar from "../../components/avatar/avatar.component";
import Loader from "../../components/loader/loader.component";
import { ToastsHandlerType } from "../../App.hook";

type LoginData = {
  email: string;
  password: string;
};

type LoginProps = {
  storageName: string;
  handleToast: (data: ToastsHandlerType) => void;
  setIsAutorization: (token: string) => void;
};

const Login: React.FC<LoginProps> = ({
  setIsAutorization,
  storageName,
  handleToast,
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (values: LoginData) => {
    setLoading(true);

    axios
      .post(`/api/auth/login`, {
        email: values.email,
        password: values.password,
      })
      .then((res) => {
        const persons = res.data;
        handleToast({ text: "Logged in", type: "success" });
        localStorage.setItem(
          storageName,
          JSON.stringify({ userId: persons.userId, token: persons.token })
        );
        setIsAutorization(persons.token);
      })
      .catch((err) => {
        handleToast({ text: err.response.data.message, type: "error" });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const loginFormSchema = Yup.object().shape({
    email: Yup.string().email().required("Required"),
    password: Yup.string().required("Required"),
  });

  const initialValues: LoginData = {
    email: "",
    password: "",
  };

  return (
    <div className={classes.login}>
      <Avatar title="FM" />
      <div className={classes.window}>
        <Formik
          initialValues={initialValues}
          validationSchema={loginFormSchema}
          onSubmit={(values: LoginData) => handleSubmit(values)}
        >
          {({ errors }) => (
            <Form>
              <h2>Login</h2>
              <div className={classes.infoContainer}>
                <InfoItem
                  name="Email"
                  form={{ name: "email", type: "text", error: errors.email }}
                />
                <InfoItem
                  name="Password"
                  form={{ name: "password", type: "password" }}
                />
              </div>
              <div className={classes.flex}>
                <Button name="Login" mainType="submit" />
                <Button
                  name="Sign up"
                  type="secondary"
                  onClick={() => navigate("/sign-up")}
                />
                {loading && <Loader size="small" position="bottom" />}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;
