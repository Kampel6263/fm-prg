import React, { useEffect, useState } from "react";
import axios from "axios";

import classes from "./profile.module.scss";
import {
  CostDataType,
  InUseType,
  PeterDataType,
  UserDataType,
} from "../../App";
import { Field, Form, Formik } from "formik";
import InfoItem from "../../components/infoItem/infoItem.component";
import Button from "../../components/button/button.component";
import * as Yup from "yup";
import Credit from "../../components/credit/credit.component";
import Loader from "../../components/loader/loader.component";
import CostItem from "../../components/costItem/costItem.component";
import { toast } from "react-toastify";
import Avatar from "../../components/avatar/avatar.component";

type HomeProps = {
  token: string;
  peterData: PeterDataType | undefined;
  costsData: CostDataType[];
  userData: UserDataType;
  getBankData: () => void;
  getUserData: () => void;
  getAllUsers: () => void;
  getCostsData: () => void;
};

type initialValuesType = {
  sum: number;
  monthCount: number;
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

const getCreditFormSchema = Yup.object().shape({
  sum: Yup.number().required("Required"),
  monthCount: Yup.number().required("Required"),
});

const paymentFormSchema = Yup.object().shape({
  payment: Yup.number().required("Required"),
});

const editInfoSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  salary: Yup.string().required("Required"),
  ssc: Yup.string().required("Required"),
  vat: Yup.string().required("Required"),
  company: Yup.string().required("Required"),
});

const Home: React.FC<HomeProps> = ({
  token,
  peterData,
  costsData,
  userData,
  getUserData,
  getBankData,
  getAllUsers,
  getCostsData,
}) => {
  const [showCreditsForm, setShowCreditsForm] = useState(false);
  const [showTakePaymentInput, setShowTakePaymentInput] = useState(false);
  const [myOpenCredit, setMyOpenCredit] = useState<InUseType>();
  const [myCloseCredit, setMyCloseCredit] = useState<InUseType[]>();
  const [showHistory, setShowHistory] = useState(false);
  const [editInfo, setEditInfo] = useState(false);
  const [editInfoLoading, setEditInfoLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const openCredit = peterData?.inUse.filter(
      (el) => el.userId === userData._id && el.open
    )[0];

    const closeCredit = peterData?.inUse.filter(
      (el) => el.userId === userData._id && !el.open
    );

    setMyOpenCredit(openCredit);
    setMyCloseCredit(closeCredit);
  }, [peterData?.inUse, userData._id]);

  const initialValues: initialValuesType = {
    sum: 0,
    monthCount: 1,
  };

  const paymentInitialValues: paymentInitialValuesType = {
    payment: myOpenCredit
      ? myOpenCredit.remains < myOpenCredit.paymentPerMonth
        ? myOpenCredit.remains
        : myOpenCredit.paymentPerMonth
      : 0,
  };

  const getOverpayment = (sum: number, monthCount: number) => {
    return Math.ceil(sum * monthCount * 0.04);
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
        toast.success("Credit taken!");
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
        toast.success("Payment saved!");
      })
      .catch((err) => {
        toast.error(err.response.statusText);
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
        toast.success("Saved!");
      });
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

  const initialInfoValues: editInfoType = {
    name: userData.name,
    salary: userData.salary,
    ssc: userData.ssc,
    vat: userData.vat,
    company: userData.company,
  };

  return (
    <div className={classes.profile}>
      <Avatar
        title={userData.name ? userData.name[0] : userData?.email[0]}
        subtitle={userData.name ? `Hello ${userData.name}!` : userData?.email}
      />

      <div className={classes.container}>
        <div className={classes.info}>
          <div className={classes.flex}>
            <h2>Profile info</h2>
            <Button
              name={editInfo ? "Cancel" : "Edit"}
              onClick={() => setEditInfo(!editInfo)}
              size="small"
              type={editInfo ? "cancel" : "submit"}
            />
          </div>

          {editInfo ? (
            <>
              <Formik
                onSubmit={handleEditInfo}
                initialValues={initialInfoValues}
                validationSchema={editInfoSchema}
              >
                {({ errors, values }) => (
                  <Form>
                    <div className={classes.infoContainer}>
                      <InfoItem
                        name="Name"
                        form={{
                          name: "name",
                          type: "text",
                          error: errors.name,
                        }}
                        loading={editInfoLoading}
                      />
                      <InfoItem
                        name="Email"
                        value={userData.email}
                        loading={editInfoLoading}
                      />
                      <InfoItem
                        name="Credit"
                        value={myOpenCredit?.userId ? "Yes" : "No"}
                        loading={editInfoLoading}
                      />
                      <InfoItem
                        name="Salary"
                        form={{
                          name: "salary",
                          type: "number",
                          error: errors.salary,
                        }}
                        loading={editInfoLoading}
                      />
                      <InfoItem
                        name="Vat"
                        form={{
                          name: "vat",
                          type: "number",
                          error: errors.vat,
                        }}
                        loading={editInfoLoading}
                      />
                      <InfoItem
                        name="SSC"
                        form={{
                          name: "ssc",
                          type: "number",
                          error: errors.ssc,
                        }}
                        loading={editInfoLoading}
                      />
                      <InfoItem
                        name="Salary net"
                        value={
                          values.salary -
                          (values.salary * values.vat) / 100 -
                          values.ssc +
                          "₴"
                        }
                        loading={editInfoLoading}
                      />

                      <InfoItem
                        name="Company"
                        form={{
                          name: "company",
                          type: "text",
                          error: errors.company,
                        }}
                        loading={editInfoLoading}
                      />
                    </div>
                    {editInfo && <Button name="Save" mainType="submit" />}
                  </Form>
                )}
              </Formik>
            </>
          ) : (
            <div className={classes.infoContainer}>
              <InfoItem name="Name" value={userData?.name || "empty"} />
              <InfoItem name="Email" value={userData?.email} />
              <InfoItem
                name="Credit"
                value={myOpenCredit?.userId ? "Yes" : "No"}
              />
              <InfoItem name="Salary" value={userData.salary + "₴"} />
              <InfoItem name="VAT" value={userData.vat + "%"} />
              <InfoItem name="SSC" value={userData.ssc + "₴"} />
              <InfoItem
                name="Salary net"
                value={
                  userData.salary -
                  (userData.salary * userData.vat) / 100 -
                  userData.ssc +
                  "₴"
                }
              />
              <InfoItem name="Company" value={userData.company} />
            </div>
          )}
        </div>
        <div className={classes.costs}>
          <h2>Costs</h2>
          <div className={classes.table}>
            <div className={classes.row}>
              <div>Name</div>
              <div>Spent</div>
              <div>Have</div>
              <div>Amount</div>
            </div>
            {costsData
              .filter((el) =>
                userData.email === "andrian6263@gmail.com"
                  ? el.andrianSum
                  : el.tanyaSum
              )
              .map((el) => (
                <CostItem
                  key={el._id}
                  data={el}
                  token={token}
                  getCostData={() => getCostsData()}
                  userEmail={userData.email}
                  withComments
                />
              ))}
            <div className={classes.row}>
              <div>Total</div>
              {userData.email === "andrian6263@gmail.com" ? (
                <>
                  <div>{getTotal(costsData, "andrianSpent")}</div>
                  <div>
                    {getTotal(costsData, "andrianSum") -
                      getTotal(costsData, "andrianSpent")}
                  </div>
                  <div>{getTotal(costsData, "andrianSum")}</div>
                </>
              ) : (
                <>
                  <div>{getTotal(costsData, "tanyaSpent")}</div>
                  <div>
                    {getTotal(costsData, "tanyaSum") -
                      getTotal(costsData, "tanyaSpent")}
                  </div>
                  <div>{getTotal(costsData, "tanyaSum")}</div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className={classes.credit}>
          <div className={classes.flex}>
            <h2>Credit</h2>
            {myOpenCredit?.open && (
              <div>
                {showTakePaymentInput && (
                  <div className={classes.paymentForm}>
                    <Formik
                      onSubmit={handleEnterPayment}
                      initialValues={paymentInitialValues}
                      validationSchema={paymentFormSchema}
                    >
                      {({ errors }) => (
                        <Form className={errors.payment && classes.error}>
                          <label htmlFor="payment">Sum:</label>
                          <Field
                            type={"number"}
                            id="payment"
                            name={"payment"}
                            min={0}
                          />
                          <Button
                            size="small"
                            mainType="submit"
                            name="Enter"
                            disabled={loading}
                          />
                        </Form>
                      )}
                    </Formik>
                  </div>
                )}

                <Button
                  size="small"
                  onClick={() => setShowTakePaymentInput(!showTakePaymentInput)}
                  name={showTakePaymentInput ? "Cancel" : "Enter"}
                  type={showTakePaymentInput ? "cancel" : "submit"}
                  disabled={loading}
                />
              </div>
            )}
          </div>

          {myOpenCredit?.open ? (
            <Credit myInfo={myOpenCredit} loading={loading} />
          ) : (
            <div>
              {!showCreditsForm && (
                <div className={classes.empty}>
                  <span className={classes.noCredit}>
                    You dont have any credits
                  </span>
                  <Button
                    name="Take credit"
                    onClick={() => setShowCreditsForm(true)}
                  />
                </div>
              )}

              {showCreditsForm && (
                <div>
                  <Formik
                    initialValues={initialValues}
                    validationSchema={getCreditFormSchema}
                    onSubmit={(values: initialValuesType) =>
                      handleSubmit(values)
                    }
                  >
                    {({ values, errors }) => (
                      <Form>
                        <div className={classes.infoContainer}>
                          <InfoItem
                            name="Sum"
                            loading={loading}
                            form={{
                              name: "sum",
                              type: "number",
                              error: errors.sum,
                            }}
                          />
                          <InfoItem
                            name="Month count"
                            loading={loading}
                            form={{
                              name: "monthCount",
                              type: "number",
                              error: errors.monthCount,
                            }}
                          />

                          {values.sum && values.monthCount ? (
                            <>
                              <InfoItem
                                name="Overpayment"
                                loading={loading}
                                value={getOverpayment(
                                  values.sum,
                                  values.monthCount
                                )}
                              />
                              <InfoItem
                                name="Payment for month"
                                loading={loading}
                                value={Math.ceil(
                                  (values.sum +
                                    getOverpayment(
                                      values.sum,
                                      values.monthCount
                                    )) /
                                    values.monthCount
                                )}
                              />
                            </>
                          ) : (
                            <>
                              <InfoItem
                                name="Overpayment"
                                loading={loading}
                                value={"0"}
                              />

                              <InfoItem
                                name="Payment for month"
                                loading={loading}
                                value="0"
                              />
                            </>
                          )}
                        </div>
                        <div className={classes.buttons}>
                          <span className={classes.cancel}>
                            <Button
                              name="Cancel"
                              type="cancel"
                              size="small"
                              onClick={() => setShowCreditsForm(false)}
                              disabled={loading}
                            />
                          </span>

                          <Button
                            name="Take"
                            size="small"
                            mainType="submit"
                            disabled={loading}
                          />
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={classes.history}>
          <div className={classes.flex}>
            <h2>History</h2>
            <Button
              name={showHistory ? "Hide" : "Show"}
              type={showHistory ? "cancel" : "submit"}
              size="small"
              onClick={() => {
                setShowHistory(!showHistory);
              }}
            />
          </div>
          <div className={classes.historySection}>
            {showHistory && (
              <div>
                {myCloseCredit?.length ? (
                  <div className={classes.historyMap}>
                    {myCloseCredit?.map((el, i) => (
                      <div className={classes.border}>
                        <Credit myInfo={el} type={"history"} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>History is clean</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
