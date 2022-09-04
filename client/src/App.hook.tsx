import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export type ToastsHandlerType = {
  text: string;
  type: "error" | "success" | "info" | "warning";
};

// if (isAutorization) {
//   await axios
//     .get(`/api/user/all`, {
//       headers: { Authorization: `Bearer ${isAutorization}` },
//     })
//     .then((res) => {
//       setAllUsers(res.data.response);
//     })
//     .catch((err) => {
//       handleErrors(err.response);
//       throw new Error(err.response.statusText);
//     })
//     .finally(() => {});
// }

const storageName: string = "userData";

const useAppData = () => {
  const [isAutorization, setIsAutorization] = useState("");

  const [USD_value, setUSD_value] = useState<number | null>(null);

  const handleToast = (data: ToastsHandlerType) => {
    const { text, type } = data;
    toast[type](text);
  };

  const date = new Date();
  const today =
    date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

  useEffect(() => {
    const data = !!localStorage?.getItem(storageName)
      ? JSON.parse(localStorage?.getItem(storageName) || "")
      : null;

    if (data?.token) {
      setIsAutorization(data.token);
    }
  }, []);

  const handleLogOut = () => {
    localStorage.removeItem(storageName);
    setIsAutorization("");
  };

  const changeCurrency = (id: string, USD: number) => {
    axios
      .put(
        "api/currency/change",
        { id, USD },
        {
          headers: { Authorization: `Bearer ${isAutorization}` },
        }
      )
      .then((res) => {})
      .catch((err) => {
        // handleToast({text:})
      });
  };

  const getActualCurrency = (id: string) => {
    axios
      .get(
        "https://api.apilayer.com/exchangerates_data/convert?to=UAH&from=USD&amount=1",
        {
          headers: { apiKey: "Paet35BNenX39Stke7ewOaoJaEnuNFko" },
        }
      )
      .then((res) => {
        changeCurrency(id, res.data.result);
      })
      .catch((err) => {
        // handleToast({text:})
      });
  };

  useEffect(() => {
    if (isAutorization && !USD_value) {
      axios
        .get("api/currency/", {
          // headers: { apiKey: "Paet35BNenX39Stke7ewOaoJaEnuNFko" },
          headers: { Authorization: `Bearer ${isAutorization}` },
        })
        .then((res) => {
          const { date, USD, _id } = res.data.response;

          if (date !== today) {
            getActualCurrency(_id);
          } else {
            setUSD_value(USD);
          }
        })
        .catch((err) => {
          // handleToast({text:})
        });
    }
  }, [isAutorization]);

  return {
    USD_value,
    isAutorization,
    storageName,
    handleToast,
    handleLogOut,
    setIsAutorization,
  };
};

export { useAppData };
