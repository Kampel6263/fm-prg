import { InUseType, UserDataType } from "./../../App";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ToastsHandlerType } from "../../App.hook";

export type initialValuesType = {
  sum: number;
  monthCount: number;
};

type useProfileDataProps = {
  token: string;
  userData: UserDataType;
  handleToast: (data: ToastsHandlerType) => void;
  getBankData: () => void;
  getUserData: () => void;
  getAllUsers: () => void;
};

type paymentInitialValuesType = {
  payment: number;
};

type editInfoType = {
  name: string;
  salary: number;
  ssc: number;
  vat: number;
  company: string;
};

type profileInfoDataType = {
  name: string;
  value: string | number;
  form?: boolean;
  type?: "number" | "text";
  salNet?: boolean;
};

const useProfileData = ({
  userData,
  token,
  getBankData,
  handleToast,
  getUserData,
  getAllUsers,
}: useProfileDataProps) => {
  const [loading, setLoading] = useState(false);
  const [showCreditsForm, setShowCreditsForm] = useState(false);
  const [myOpenCredit, setMyOpenCredit] = useState<InUseType>();
  const [showTakePaymentInput, setShowTakePaymentInput] = useState(false);
  const [editInfoLoading, setEditInfoLoading] = useState(false);
  const [editInfo, setEditInfo] = useState(false);
  const initialValues: initialValuesType = {
    sum: 0,
    monthCount: 1,
  };

  const profileInfoData: profileInfoDataType[] = [
    {
      name: "Name",
      value: userData.name || "Empty",
      form: true,
      type: "text",
    },
    {
      name: "Email",
      value: userData.email,
    },
    {
      name: "Credit",
      value: myOpenCredit?.userId ? "Yes" : "No",
    },
    {
      name: "Salary",
      value: userData.salary + "₴",
      form: true,
      type: "number",
    },
    {
      name: "Vat",
      value: userData.vat + "%",
      form: true,
      type: "number",
    },
    {
      name: "SSC",
      value: userData.ssc + "₴",
      form: true,
      type: "number",
    },
    {
      name: "Salary net",
      value:
        userData.salary -
        (userData.salary * userData.vat) / 100 -
        userData.ssc +
        "₴",
      salNet: true,
    },
    {
      name: "Company",
      value: userData.company,
    },
  ];

  const paymentInitialValues: paymentInitialValuesType = {
    payment: myOpenCredit
      ? myOpenCredit.remains < myOpenCredit.paymentPerMonth
        ? myOpenCredit.remains
        : myOpenCredit.paymentPerMonth
      : 0,
  };

  const initialInfoValues: editInfoType = {
    name: userData.name,
    salary: userData.salary,
    ssc: userData.ssc,
    vat: userData.vat,
    company: userData.company,
  };

  const getOverpayment = (sum: number, monthCount: number) => {
    return Math.ceil(sum * monthCount * 0.04);
  };

  const getTotal = (
    arr: any,
    key: "andrianSum" | "tanyaSum" | "salary" | "andrianSpent" | "tanyaSpent"
  ) => {
    let sum = 0;

    if (key === "salary") {
      for (let el of arr) {
        sum += el[key] - (el[key] * el.vat) / 100 - el.ssc;
      }
    } else {
      for (let el of arr) {
        sum += el[key];
      }
    }

    return sum;
  };

  const handleSubmit = (values: initialValuesType) => {
    setLoading(true);
    axios
      .post(
        `/api/bank/getCredit`,
        {
          sum: values.sum,
          overpayment: getOverpayment(values.sum, values.monthCount),
          monthCount: values.monthCount,
          name: userData?.name,
          email: userData?.email,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(async (res) => {
        await getBankData();
        handleToast({ text: "Credit taken", type: "success" });
      })
      .catch((err) => {
        console.log(err.response, "err");
      })
      .finally(() => {
        setShowCreditsForm(false);
        setLoading(false);
      });
  };
  const handleEnterPayment = (values: paymentInitialValuesType) => {
    setLoading(true);
    axios
      .post(
        `/api/bank/enterPayment`,
        {
          payment: values.payment,
          creditClosed: values.payment >= (myOpenCredit?.remains || 0),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(async (res) => {
        await getBankData();
        handleToast({ text: "Payment saved!", type: "success" });
      })
      .catch((err) => {
        handleToast({ text: err.response.statusText, type: "error" });
      })
      .finally(() => {
        setShowTakePaymentInput(false);
        setLoading(false);
      });
  };
  const handleEditInfo = (values: editInfoType) => {
    setEditInfoLoading(true);

    axios
      .put(
        `/api/user/edit`,
        {
          id: userData._id,
          name: values.name,
          salary: values.salary,
          ssc: values.ssc,
          vat: values.vat,
          company: values.company,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(async (res) => {
        //  console.log9
        await getUserData();
        await getAllUsers();
      })
      .catch((err) => {
        console.log(err.response, "err");
      })
      .finally(() => {
        setEditInfo(false);
        setEditInfoLoading(false);
        handleToast({ text: "Saved!", type: "success" });
      });
  };

  return {
    editInfo,
    initialInfoValues,
    editInfoLoading,
    myOpenCredit,
    showTakePaymentInput,
    paymentInitialValues,
    loading,
    showCreditsForm,
    initialValues,
    profileInfoData,
    getOverpayment,
    handleSubmit,
    setShowCreditsForm,
    setShowTakePaymentInput,
    handleEnterPayment,
    setEditInfo,
    setMyOpenCredit,
    handleEditInfo,
    getTotal,
  };
};

export { useProfileData };
