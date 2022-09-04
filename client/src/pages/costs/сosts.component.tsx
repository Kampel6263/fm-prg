import axios from "axios";
import classNames from "classnames";
import { Field, Form, Formik } from "formik";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { CostDataType, UserDataType } from "../../App";
import { ToastsHandlerType, useAppData } from "../../App.hook";
import Avatar from "../../components/avatar/avatar.component";
import Button from "../../components/button/button.component";
import CostItem from "../../components/costItem/costItem.component";
import InfoItem from "../../components/infoItem/infoItem.component";
import classes from "./costs.module.scss";

export type AddFormType = {
  name: string;
  andrianSum: number;
  tanyaSum: number;
};

type CostProps = {
  token: string;
  costData: CostDataType[];
  getCostData: () => void;
  handleToast: (data: ToastsHandlerType) => void;
  users: UserDataType[];
  USD_value: number;
};

export type ArchiveCostDataType = {
  date: string;
  costs: CostDataType[];
  andrianTotal: number;
  tanyaTotal: number;
  total: number;
};

const Costs: React.FC<CostProps> = ({
  token,
  costData,
  getCostData,
  handleToast,
  users,
  USD_value,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const initialValuesAddForm: AddFormType = {
    name: "Input name",
    andrianSum: 0,
    tanyaSum: 0,
  };

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleAddSubmit = (values: AddFormType) => {
    setLoading(true);
    axios
      .post(`/api/cost/add`, values, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(async (res) => {
        await getCostData();
        toast.success("Costs added!");
      })
      .catch((err) => {
        console.log(err.response, "err");
      })
      .finally(() => {
        setShowAddForm(false);
        setLoading(false);
      });
  };

  const getTotal = (arr: any, key: "andrianSum" | "tanyaSum" | "salary") => {
    let sum = 0;

    if (key === "salary") {
      for (let el of arr) {
        sum += el[key] - Math.ceil((el[key] * el.vat) / 100) - el.ssc;
      }
    } else {
      for (let el of arr) {
        sum += el[key];
      }
    }

    return sum;
  };

  const andrianTotal = getTotal(costData, "andrianSum");
  const tanyaTotal = getTotal(costData, "tanyaSum");

  const planCosts =
    getTotal(costData, "andrianSum") + getTotal(costData, "tanyaSum");

  const constsForMonth = getTotal(users, "salary");

  const removeAllCosts = (nullSumValue: boolean) => {
    if (token) {
      axios
        .put(
          `/api/cost/clear`,
          { nullSumValue: nullSumValue },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((res) => {
          getCostData();
          handleToast({ text: "Costs removed", type: "warning" });
        })
        .catch((err) => {
          // handleErrors(err.response);
          console.log(err, "arch err");
          throw new Error(err.response.statusText);
        })
        .finally(() => {});
    }
  };

  const saveCosts = ({
    date,
    nullSumValue,
  }: {
    date: string;
    nullSumValue: boolean;
  }) => {
    const archiveCostData: ArchiveCostDataType = {
      date,
      costs: costData,
      andrianTotal,
      tanyaTotal,
      total: planCosts,
    };

    if (token) {
      axios
        .post(`/api/archive/add`, archiveCostData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          removeAllCosts(nullSumValue);
          handleToast({ text: "Costs added to archive!", type: "success" });
        })
        .catch((err) => {
          // handleErrors(err.response);
          console.log(err, "arch err");
          throw new Error(err.response.statusText);
        })
        .finally(() => {});
    }
  };
  console.log(USD_value);
  return (
    <div className={classes.costs}>
      <Avatar
        title={Math.ceil(constsForMonth / (USD_value || 36)) + "$"}
        subtitle={costData.length ? `Costs: ${constsForMonth}₴` : "Costs"}
      />

      <div className={classes.container}>
        <div className={classes.info}>
          <div className={classes.flex}>
            <h2>Costs for month</h2>
            <Button
              name={"Clear and save"}
              size="small"
              type={"submit"}
              onClick={() => setModalIsOpen(true)}
              disabled={loading}
            />
          </div>
          <div className={classes.infoContainer}>
            {users.length &&
              users.map((el) => (
                <InfoItem
                  key={el._id}
                  name={el.name || el.email}
                  value={
                    el.salary -
                    Math.ceil((el.salary * el.vat) / 100) -
                    el.ssc +
                    "₴"
                  }
                />
              ))}

            <InfoItem name="Total" value={constsForMonth + "₴"} />
            <InfoItem name="Free" value={constsForMonth - planCosts + "₴"} />
          </div>
        </div>
        <div className={classes.flex}>
          <h2>Costs plan</h2>
          <Button
            name={showAddForm ? "Cancel" : "Add"}
            size="small"
            type={showAddForm ? "cancel" : "submit"}
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={loading}
          />
        </div>

        <div className={classes.table}>
          <div className={classes.row}>
            <div>Name</div>
            <div>Andrian</div>
            <div>Tanya</div>
            <div>Amount</div>
          </div>
          {costData.map((el) => (
            <CostItem
              key={el._id}
              data={el}
              token={token}
              getCostData={() => getCostData()}
            />
          ))}

          {showAddForm && (
            <Formik
              initialValues={initialValuesAddForm}
              onSubmit={handleAddSubmit}
            >
              {({ values }) => (
                <Form>
                  <div
                    className={classNames(
                      classes.row,
                      classes.form,
                      loading && classes.loading
                    )}
                  >
                    <Field className={classes.name} name={"name"} autoFocus />
                    <Field type="number" name={"andrianSum"} />
                    <Field type="number" name={"tanyaSum"} />
                    <div className={classes.rowItem}>
                      {Number(values.andrianSum) + Number(values.tanyaSum)}₴
                    </div>
                    <div className={classes.addButton}>
                      <Button
                        name="✓"
                        disabled={loading}
                        size="short"
                        mainType="submit"
                      />
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          )}

          <div className={classes.row}>
            <div>Total</div>
            <div>{getTotal(costData, "andrianSum")}</div>
            <div>{getTotal(costData, "tanyaSum")}</div>
            <div>
              {getTotal(costData, "andrianSum") +
                getTotal(costData, "tanyaSum")}
            </div>
          </div>
        </div>
      </div>
      {modalIsOpen && (
        <div className={classes.saveCostModal}>
          <Formik
            initialValues={{ date: "", nullSumValue: false }}
            onSubmit={(values) => {
              saveCosts(values);
              setModalIsOpen(false);
            }}
          >
            {({ values }) => (
              <Form>
                <h1>Clear cost and save</h1>
                <h3>Choose date</h3>
                <div
                  className={classes.closeModal}
                  onClick={() => setModalIsOpen(false)}
                >
                  &times;
                </div>
                <div>
                  <Field type={"month"} name={"date"} />
                </div>
                <div className={classes.checkbox}>
                  <Field
                    type={"checkbox"}
                    name={"nullSumValue"}
                    id="nullSumValue"
                  />
                  <label htmlFor="nullSumValue">Reset the value of sums</label>
                </div>

                <Button
                  name={values.date ? "Save" : "Choose date..."}
                  type="submit"
                  mainType="submit"
                  disabled={!values.date}
                ></Button>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </div>
  );
};

export default Costs;
