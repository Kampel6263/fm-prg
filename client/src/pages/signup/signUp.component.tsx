import React, { useState } from "react";
import axios from "axios";
import { Field, Form, Formik } from "formik";
import classes from "../login/login.module.scss";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "../../components/avatar/avatar.component";
import InfoItem from "../../components/infoItem/infoItem.component";
import Button from "../../components/button/button.component";

import Loader from "../../components/loader/loader.component";
import { ToastsHandlerType } from "../../App.hook";

type LoginData = {
  email: string;
  password: string;
  img: any;
};

type SighUpProps = {
  handleToast: (data: ToastsHandlerType) => void;
};

const SignUp: React.FC<SighUpProps> = ({ handleToast }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleSubmit = (values: LoginData) => {
    setLoading(true);
    axios
      .post(`/api/auth/register`, {
        email: values.email,
        password: values.password,
        name: "",
      })
      .then((res) => {
        navigate("/login");
        handleToast({ text: "Account created", type: "success" });
      })
      .catch((err) => {
        handleToast({ text: err.response.data.message, type: "error" });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const initialValues: LoginData = {
    email: "",
    password: "",
    img: null,
  };

  return (
    <div className={classes.login}>
      <Avatar title="FM" />
      <div className={classes.window}>
        <Formik
          initialValues={initialValues}
          onSubmit={(values: LoginData) => handleSubmit(values)}
        >
          {({ errors }) => (
            <Form>
              <h2>Sign up</h2>
              <div className={classes.infoContainer}>
                <InfoItem
                  name="Email"
                  form={{ name: "email", type: "text", error: errors.email }}
                />
                <InfoItem
                  name="Password"
                  form={{
                    name: "password",
                    type: "password",
                    error: errors.email,
                  }}
                />
              </div>
              <div className={classes.flex}>
                <Button name="Sign up" />

                <Button
                  name="Login"
                  type="secondary"
                  onClick={() => navigate("/login")}
                />
                {loading && <Loader size="small" />}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default SignUp;
