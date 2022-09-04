import axios from "axios";
import classNames from "classnames";
import { Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "../../components/avatar/avatar.component";
import Button from "../../components/button/button.component";
import CostItem from "../../components/costItem/costItem.component";
import Loader from "../../components/loader/loader.component";
import { ArchiveCostDataType } from "../costs/сosts.component";
import classes from "./archive.module.scss";

type ArchiveProps = {
  token: string;
};

const Archive: React.FC<ArchiveProps> = ({ token }) => {
  const navigate = useNavigate();
  const [archive, setArchive] = useState<ArchiveCostDataType[]>();
  const [choosenDate, setChoosenDate] = useState<string>("");
  const [costData, setCostData] = useState<ArchiveCostDataType>();
  const [loader, setLoader] = useState(true);
  useEffect(() => {
    setLoader(true);
    axios
      .get(`/api/archive/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setArchive(res.data.response.reverse());
      })
      .catch((err) => {})
      .finally(() => {
        setLoader(false);
      });
  }, []);

  const pickDate = (date: string) => {
    setChoosenDate(date);
  };

  useEffect(() => {
    if (choosenDate) {
      const data = archive?.filter((el) => el.date === choosenDate)[0];
      setCostData(data);
    }
  }, [choosenDate]);

  return (
    <div className={classes.archive}>
      <Avatar title={choosenDate?.slice(2, 7) || "A"} subtitle="Archive" />
      {archive?.length === 0 ? (
        <div className={classes.container}>
          <div className={classes.empty}>
            <span className={classes.noCredit}>Archive is empty</span>
            <Button name="Costs page" onClick={() => navigate("/costs")} />
          </div>
        </div>
      ) : loader ? (
        <div className={classes.container}>
          <Loader position="bottom" type="dot" />
        </div>
      ) : (
        <div className={classes.container}>
          <h2>Recently:</h2>
          <div className={classes.box}>
            {archive?.slice(0, 5).map((el, i) => (
              <div
                key={el.date + i}
                className={
                  el.date === choosenDate
                    ? classNames(classes.dateItem, classes.active)
                    : classes.dateItem
                }
                onClick={() => pickDate(el.date)}
              >
                {el.date}
              </div>
            ))}
          </div>
          <div className={classes.diver}>or</div>
          <h2>Pick date</h2>
          <Formik
            initialValues={{ date: "" }}
            onSubmit={(values) => pickDate(values.date)}
          >
            {({ values }) => (
              <Form className={classes.pickDateForm}>
                <Field type={"month"} name={"date"} />
                {values.date && (
                  <Button
                    mainType="submit"
                    name="Choose"
                    size="small"
                    disabled={!values.date}
                  />
                )}
              </Form>
            )}
          </Formik>
          <h2>Cost sheet</h2>
          {costData ? (
            <div className={classes.table}>
              <div className={classes.row}>
                <div>Name</div>
                <div>Andrian</div>
                <div>Tanya</div>
                <div>Amount</div>
              </div>
              {costData.costs.map((el) => (
                <CostItem key={el._id} data={el} token={token} withComments />
              ))}

              <div className={classes.row}>
                <div>Total</div>
                <div>{costData.andrianTotal}</div>
                <div>{costData.tanyaTotal}</div>
                <div>{costData.andrianTotal + costData.tanyaTotal}</div>
              </div>
            </div>
          ) : (
            <div className={classes.empty}>
              <span className={classes.noCredit}>
                {choosenDate
                  ? "No saved costs on this date"
                  : "Plase, choose date"}
              </span>
              {/* <Button
            name="Show history"
            onClick={() => setShowHistory(true)}
          /> */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Archive;
