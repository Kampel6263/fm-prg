import axios from "axios";
import { Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { InUseType, PeterDataType } from "../../App";
import { ToastsHandlerType } from "../../App.hook";

import Avatar from "../../components/avatar/avatar.component";
import Button from "../../components/button/button.component";
import Credit from "../../components/credit/credit.component";
import InfoItem from "../../components/infoItem/infoItem.component";
import classes from "./bank.module.scss";

type BankProps = {
  peterData: PeterDataType | undefined;
  token: string;
  getBankData: () => void;

  USD_value: number;
};

const Bank: React.FC<BankProps> = ({
  peterData,
  token,
  getBankData,

  USD_value,
}) => {
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showStorageForm, setShowStorageForm] = useState(false);
  const initialStorageData = {
    mono: peterData?.typeOfStorage.filter((el) => el.typeName === "Mono")[0]
      .amount,
    cash: peterData?.typeOfStorage.filter((el) => el.typeName === "Cash")[0]
      .amount,
    privat: peterData?.typeOfStorage.filter((el) => el.typeName === "Privat")[0]
      .amount,
  };

  const [closeCredit, setCloseCredit] = useState<InUseType[]>();

  let navigate = useNavigate();

  useEffect(() => {
    setCloseCredit(peterData?.inUse.filter((el) => !el.open));
  }, [peterData]);

  const handleSubmit = (values: any) => {
    const { mono, cash, privat } = values;
    setLoading(true);
    axios
      .post(
        `/api/bank/editStorage`,
        {
          mono,
          cash,
          privat,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(async (res) => {
        await getBankData();
        toast.success("Storage saved!");
      })
      .catch((err) => {
        console.log(err.response, "err");
      })
      .finally(() => {
        setLoading(false);
        setShowStorageForm(false);
      });
  };

  let totalInUse = 0;
  if (peterData?.total) {
    for (let el of peterData?.inUse) {
      if (el.open) {
        totalInUse += el.sum - (el.sum + el.overpayment) + el.remains;
      }
    }
  }

  return (
    <div className={classes.bank}>
      <Avatar
        title={
          Math.round(
            peterData?.total ? peterData.total / (USD_value || 36) : 0
          ) + "$"
        }
        subtitle={`Bank: ${peterData?.total}₴`}
      />
      <div className={classes.container}>
        <div className={classes.storage}>
          <div className={classes.flex}>
            <h2>Storages</h2>
            <Button
              onClick={() => setShowStorageForm(!showStorageForm)}
              name={showStorageForm ? "Cancel" : "Edit"}
              type={showStorageForm ? "cancel" : "submit"}
              size="small"
            />
          </div>

          {showStorageForm ? (
            <Formik onSubmit={handleSubmit} initialValues={initialStorageData}>
              <Form>
                <div className={classes.infoContainer}>
                  {peterData?.typeOfStorage.map((el, i) => (
                    <InfoItem
                      name={el.typeName}
                      form={{ name: el.typeName.toLowerCase(), type: "number" }}
                      key={el.typeName + i}
                      loading={loading}
                    />
                  ))}
                  <Button name="Save" mainType="submit" />
                </div>
              </Form>
            </Formik>
          ) : (
            <div className={classes.infoContainer}>
              {peterData?.typeOfStorage.map((el, i) => (
                <InfoItem
                  name={el.typeName}
                  value={el.amount + "₴"}
                  key={el.typeName + i}
                  loading={loading}
                />
              ))}
            </div>
          )}
        </div>

        <div className={classes.inUse}>
          <h2>In use: {totalInUse >= 0 ? totalInUse : 0}₴</h2>
          {peterData &&
          closeCredit &&
          peterData?.inUse.length > closeCredit?.length ? (
            <div className={classes.mapUserInfo}>
              {peterData?.inUse.map(
                (el, i) =>
                  el.open && (
                    <div
                      key={el.email + i}
                      className={classes.inUseUserSection}
                    >
                      <Credit myInfo={el} type={"inUse"} />
                    </div>
                  )
              )}
            </div>
          ) : (
            <div className={classes.empty}>
              <span className={classes.noCredit}>
                You dont have any costs in use
              </span>
              <Button
                name="Show history"
                onClick={() => setShowHistory(true)}
              />
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
                {closeCredit?.length ? (
                  <div className={classes.historyMap}>
                    {closeCredit?.map((el, i) => (
                      <div className={classes.border}>
                        <Credit myInfo={el} type={"history"} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={classes.empty}>
                    <span className={classes.noCredit}>History is clean</span>
                    <Button
                      name="Take credit"
                      onClick={() => navigate("/profile")}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bank;
