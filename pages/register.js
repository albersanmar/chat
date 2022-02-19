import { Box, TextField, Button } from "@mui/material";

import LoadingButton from "@mui/lab/LoadingButton";

import { Formik, Form, Field } from "formik";

import { useRouter } from "next/router";

import { useState } from "react";

import axios from "axios";

import { useCookie, withCookie } from "next-cookie";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default withCookie(function register({ API_URL }) {
  const [clicked, setCliked] = useState({ register: false });

  const router = useRouter();

  const validateEmail = (value) => {
    let error;
    if (!value) {
      error = "Required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
      error = "Invalid email address";
    }
    return error;
  };

  const validateRequired = (value) => {
    let error;
    if (!value) {
      error = "Required";
    }
    return error;
  };

  const TextFieldName = ({ field, form, ...props }) => {
    return (
      <TextField
        label="Name"
        variant="outlined"
        margin="normal"
        {...field}
        {...props}
      />
    );
  };

  const TextFieldEmail = ({ field, form, ...props }) => {
    return (
      <TextField
        label="Email"
        type="email"
        variant="outlined"
        margin="normal"
        {...field}
        {...props}
      />
    );
  };

  const TextFieldPassword = ({ field, form, ...props }) => {
    return (
      <TextField
        label="Password"
        variant="outlined"
        type="password"
        margin="dense"
        {...field}
        {...props}
      />
    );
  };

  const login = () => router.push("/login");
  const register = async ({ name, email, password }) => {
    setCliked({ register: true });
    try {
      await axios.post(`${API_URL}api/v1/auth/register`, {
        name: name,
        email: email.replace(" ", ""),
        password: password,
        // userTypeId: "5d77ee40-905a-11ec-8966-3d2eb69a5c79",
        userTypeId: "8e9f1c60-91d0-11ec-96d9-236a3b090793",
      });
      router.push("/login");
    } catch (error) {
      console.log(error);
      toast.error("Ha ocurrido un error, no fue posible registrar al usuario");
    }
    setCliked({ register: false });
  };

  return (
    <Formik
      initialValues={{
        name: "",
        email: "",
        password: "",
      }}
      onSubmit={(values) => {
        register(values);
      }}
    >
      {({ errors, touched }) => (
        <Form>
          <ToastContainer position="top-center" />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
            style={{ height: "100vh" }}
          >
            <Field
              name="name"
              validate={validateRequired}
              component={TextFieldName}
            />
            {errors.name && touched.name && (
              <div style={{ color: "red" }}>{errors.name}</div>
            )}
            <Field
              name="email"
              validate={validateEmail}
              component={TextFieldEmail}
            />
            {errors.email && touched.email && (
              <div style={{ color: "red" }}>{errors.email}</div>
            )}
            <Field
              name="password"
              validate={validateRequired}
              component={TextFieldPassword}
            />
            {errors.password && touched.password && (
              <div style={{ color: "red" }}>{errors.password}</div>
            )}

            <div style={{ margin: 25 }}>
              <LoadingButton
                type="submit"
                loading={clicked.register}
                variant="contained"
              >
                Register
              </LoadingButton>
            </div>
            <span>Do you have an account?</span>
            <div style={{ margin: 10 }}>
              <Button variant="text" onClick={login}>
                Login
              </Button>
            </div>
          </Box>
        </Form>
      )}
    </Formik>
  );
});

export const getServerSideProps = async (ctx) => {
  const cookie = useCookie(ctx);
  const token = cookie.get("auth.token");

  if (token) {
    ctx.res.writeHead(301, {
      Location: "/rooms",
    });
    ctx.res.end();
  }
  return { props: { API_URL: process.env.API_URL } };
};
