import { Box, TextField, Button } from "@mui/material";

import LoadingButton from "@mui/lab/LoadingButton";

import { Formik, Form, Field } from "formik";

import { useRouter } from "next/router";

import { useState } from "react";

import axios from "axios";

import { useCookie, withCookie } from "next-cookie";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default withCookie(function Login({ cookie, API_URL }) {
  const [clicked, setCliked] = useState({ login: false });

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

  const login = async ({ email, password }) => {
    setCliked({ register: true });
    try {
      let response = await axios.post(`${API_URL}api/v1/auth/login`, {
        email: email.replace(" ", ""),
        password: password,
      });
      cookie.set("auth.token", response.data.data.token);
      router.push("/rooms");
    } catch (error) {
      console.log(error);
      toast.error("Ha ocurrido un error, no fue posible registrar al usuario");
    }
    setCliked({ register: false });
  };
  const register = () => router.push("/register");

  return (
    <Formik
      initialValues={{
        email: "",
        password: "",
      }}
      onSubmit={(values) => {
        login(values);
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
            <div style={{ margin: 20 }}>
              <LoadingButton
                type="submit"
                loading={clicked.register}
                variant="contained"
              >
                Login
              </LoadingButton>
            </div>
            <span>Do not you have an account?</span>
            <div style={{ margin: 20 }}>
              <Button variant="text" onClick={register}>
                Register
              </Button>
            </div>
          </Box>
        </Form>
      )}
    </Formik>
  );
});

export const getServerSideProps = async (ctx) => {
  const token = ctx.req.cookies["auth.token"];

  if (token) {
    ctx.res.writeHead(301, {
      Location: "/rooms",
    });
    ctx.res.end();
  }
  return { props: { API_URL: process.env.API_URL } };
};
