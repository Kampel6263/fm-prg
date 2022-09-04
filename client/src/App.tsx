import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
} from "react-router-dom";
import Bank from "./pages/bank/bank.component";
import Home from "./pages/profile/profile.component";
import Login from "./pages/login/login.component";
import SignUp from "./pages/signup/signUp.component";
import classes from "./App.module.scss";
import axios from "axios";
import Button from "./components/button/button.component";
import Costs from "./pages/costs/сosts.component";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./components/loader/loader.component";
import { type } from "os";
import Archive from "./pages/archive/archive.component";
import { ToastsHandlerType, useAppData } from "./App.hook";

type PaymentsType = {
  sum: number;
  date: string;
  time: string;
  remains: string;
};

export type InUseType = {
  name: string;
  email: string;
  userId: string;
  sum: number;
  monthCount: number;
  remains: number;
  date: string;
  overpayment: number;
  paymentPerMonth: number;
  open: boolean;
  payments: PaymentsType[];
};

type TypeOfStorageType = {
  typeName: string;
  amount: number;
};

export type PeterDataType = {
  total: number;
  inUse: InUseType[];
  typeOfStorage: TypeOfStorageType[];
};

export type UserDataType = {
  email: string;
  password: string;
  name: string;
  _id: string;
  salary: number;
  vat: number;
  ssc: number;
  company: string;
};

type CostPaymentsType = {
  sum: number;
  comment: string;
  date: string;
  time: string;
  user: string;
  _id: string;
};

export type CostDataType = {
  name: string;
  andrianSum: number;
  tanyaSum: number;
  _id: string;
  andrianSpent: number;
  tanyaSpent: number;
  payments: CostPaymentsType[];
};

function App() {
  const {
    isAutorization,
    storageName,
    USD_value,
    handleLogOut,
    setIsAutorization,
    handleToast,
  } = useAppData();

  const [peterData, setPeterData] = useState<PeterDataType>();
  const [userData, setUserData] = useState<UserDataType>({
    email: "",
    password: "",
    name: "",
    _id: "",
    salary: 0,
    vat: 0,
    ssc: 0,
    company: "",
  });
  const [allUsers, setAllUsers] = useState<UserDataType[]>([]);
  const [costData, setCostData] = useState<CostDataType[]>([
    {
      name: "",
      andrianSum: 0,
      tanyaSum: 0,
      _id: "",
      andrianSpent: 0,
      tanyaSpent: 0,
      payments: [],
    },
  ]);

  const [loading, setLoading] = useState(false);

  const handleErrors = (errors: any) => {
    console.log(errors, "status");
    handleToast({ text: errors.statusText, type: "error" });
    if (errors.status === 401) {
      handleLogOut();
    }
  };

  const getBankData = async () => {
    if (isAutorization) {
      await axios
        .get(`/api/bank`, {
          headers: { Authorization: `Bearer ${isAutorization}` },
        })
        .then((res) => {
          setPeterData(res.data.response);
        })
        .catch((err) => {
          handleErrors(err.response);
          throw new Error(err.response.statusText);
        })
        .finally(() => {});
    }
  };

  const getUserData = async () => {
    if (isAutorization) {
      await axios
        .get(`/api/user/`, {
          headers: { Authorization: `Bearer ${isAutorization}` },
        })
        .then((res) => {
          setUserData(res.data.response);
        })
        .catch((err) => {
          handleErrors(err.response);
          throw new Error(err.response.statusText);
        })
        .finally(() => {});
    }
  };

  const getAllUsers = async () => {
    if (isAutorization) {
      await axios
        .get(`/api/user/all`, {
          headers: { Authorization: `Bearer ${isAutorization}` },
        })
        .then((res) => {
          setAllUsers(res.data.response);
        })
        .catch((err) => {
          handleErrors(err.response);
          throw new Error(err.response.statusText);
        })
        .finally(() => {});
    }
  };

  const getCostData = async () => {
    if (isAutorization) {
      await axios
        .get(`/api/cost/`, {
          headers: { Authorization: `Bearer ${isAutorization}` },
        })
        .then((res) => {
          setCostData(res.data.response);
        })
        .catch((err) => {
          handleErrors(err.response);
          throw new Error(err.response.statusText);
        })
        .finally(() => {});
    }
  };

  const getAllData = async () => {
    setLoading(true);

    getBankData()
      .then(() => getUserData())
      .then(() => getCostData())
      .then(() => getAllUsers())
      .then(() => setLoading(false));
  };

  useEffect(() => {
    getAllData();
  }, [isAutorization]);

  return (
    <BrowserRouter>
      {isAutorization ? (
        <>
          <div className={classes.header}>
            <div className={classes.container}>
              <div>Logo</div>
              <div className={classes.navigation}>
                <NavLink
                  to="profile"
                  className={({ isActive }) =>
                    isActive ? classes.active : undefined
                  }
                >
                  Profile
                </NavLink>
                <NavLink
                  to="costs"
                  className={({ isActive }) =>
                    isActive ? classes.active : undefined
                  }
                >
                  Costs
                </NavLink>
                <NavLink
                  to="bank"
                  className={({ isActive }) =>
                    isActive ? classes.active : undefined
                  }
                >
                  Bank
                </NavLink>
                <NavLink
                  to="archive"
                  className={({ isActive }) =>
                    isActive ? classes.active : undefined
                  }
                >
                  Archive
                </NavLink>
              </div>
              <Button
                name="Log out"
                type="border"
                size="small"
                onClick={() => {
                  handleToast({ text: "Logged out", type: "warning" });
                  handleLogOut();
                }}
              />
            </div>
          </div>
          {loading ? (
            <Loader />
          ) : (
            <div>
              <Routes>
                <Route path="/*" element={<Navigate to="/profile" replace />} />
                <Route
                  path="/profile"
                  element={
                    <Home
                      token={isAutorization}
                      peterData={peterData}
                      getBankData={() => getBankData()}
                      getUserData={() => getUserData()}
                      getAllUsers={() => getAllUsers()}
                      userData={userData}
                      costsData={costData}
                      getCostsData={() => getCostData()}
                    />
                  }
                />
                <Route
                  path="/costs"
                  element={
                    <Costs
                      token={isAutorization}
                      costData={costData}
                      getCostData={() => getCostData()}
                      users={allUsers}
                      USD_value={USD_value || 36}
                      handleToast={handleToast}
                    />
                  }
                />
                <Route
                  path="/bank"
                  element={
                    <Bank
                      peterData={peterData}
                      token={isAutorization}
                      getBankData={() => getBankData()}
                      USD_value={USD_value || 36}
                    />
                  }
                />
                <Route
                  path="/archive"
                  element={
                    <Archive
                      // peterData={peterData}
                      token={isAutorization}
                      // getBankData={() => getBankData()}
                    />
                  }
                />
              </Routes>
            </div>
          )}
        </>
      ) : (
        <Routes>
          <Route path="/*" element={<Navigate to="/login" replace />} />
          <Route
            path="login"
            element={
              <Login
                setIsAutorization={(token) => setIsAutorization(token)}
                storageName={storageName}
                handleToast={handleToast}
              />
            }
          />
          <Route
            path="sign-up"
            element={<SignUp handleToast={handleToast} />}
          />
        </Routes>
      )}
      <div>
        <ToastContainer position="bottom-right" autoClose={1700} />
      </div>
    </BrowserRouter>
  );
}

export default App;
