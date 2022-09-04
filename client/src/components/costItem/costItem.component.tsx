import React, { useState } from "react";
import classes from "./costItem.module.scss";
import axios from "axios";
import classNames from "classnames";
import { Field, Form, Formik } from "formik";

import Button from "../../components/button/button.component";
import { AddFormType } from "../../pages/costs/сosts.component";
import { CostDataType } from "../../App";
import { number } from "yup";
import { toast } from "react-toastify";

type CostItemProps = {
  data: CostDataType;
  token: string;
  withComments?: boolean;
  userEmail?: string;
  getCostData?: () => void;
};

const CostItem: React.FC<CostItemProps> = ({
  token,
  data,
  getCostData,
  withComments,
  userEmail,
}) => {
  const {
    name,
    andrianSpent,
    _id,
    andrianSum,
    tanyaSpent,
    tanyaSum,
    payments,
  } = data;

  const [editRow, setEditRow] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [itemLoading, setItemLoading] = useState(false);
  const initialValues: AddFormType = {
    name,
    andrianSum,
    tanyaSum,
  };

  const handleSubmit = (values: AddFormType) => {
    setItemLoading(true);
    if (getCostData) {
      axios
        .put(
          `/api/cost/edit`,
          {
            id: _id,
            name: values.name,
            andrianSum: values.andrianSum,
            tanyaSum: values.tanyaSum,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then(async (res) => {
          //  console.log9

          await getCostData();
          toast.success("Costs edited!");
        })
        .catch((err) => {
          console.log(err.response, "err");
        })
        .finally(() => {
          setEditRow(false);
          setItemLoading(false);
        });
    }
  };

  const handleRemove = (id: string) => {
    setItemLoading(true);
    if (getCostData) {
      axios
        .delete(`/api/cost/remove`, {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            id,
          },
        })
        .then(async (res) => {
          await getCostData();
          toast.success("Costs removed!");
        })
        .catch((err) => {
          console.log(err.response, "err");
        })
        .finally(() => {
          setItemLoading(false);
        });
    }
  };

  if (userEmail) {
    const spent =
      userEmail === "andrian6263@gmail.com" ? andrianSpent : tanyaSpent;
    const spentName =
      userEmail === "andrian6263@gmail.com" ? "andrianSpent" : "tanyaSpent";
    const sum = userEmail === "andrian6263@gmail.com" ? andrianSum : tanyaSum;

    const calculate = (startVal: number, val: string) => {
      const arr: string[] = val
        .replaceAll(" ", "")
        .replaceAll("+", " + ")
        .replaceAll("-", " - ")
        .split(" ");

      if (arr.length === 1) {
        if (Number(val) === 0) {
          return startVal;
        }

        return Number(val) ? Number(val) + startVal : NaN;
      }
      if (arr.length === 0) {
        return 0;
      }
      let result = 0;
      for (let i = 0; i < arr.length; i++) {
        if (!Number(arr[i])) {
          if (arr[i] === "+") {
            if (i === 1) {
              result = Number(arr[i - 1]) + Number(arr[i + 1]);
            } else {
              result += Number(arr[i + 1]);
            }
          } else {
            if (i === 1) {
              result = Number(arr[i - 1]) - Number(arr[i + 1]);
            } else {
              result -= Number(arr[i + 1]);
            }
          }
        }
      }
      return result;
    };

    const handleSpent = (values: any) => {
      const spentCalc = calculate(data[spentName], values[spentName]);
      if ((spentCalc || spentCalc === 0) && getCostData) {
        setItemLoading(true);
        axios
          .put(
            `/api/cost/edit`,
            {
              id: _id,
              name: name,
              andrianSum: andrianSum,
              tanyaSum: tanyaSum,
              [spentName]: spentCalc,
              comment: values.comment,
              user: userEmail === "andrian6263@gmail.com" ? "Andrian" : "Tanya",
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          .then(async (res) => {
            //  console.log9

            await getCostData();
            toast.success("Costs saved!");
          })
          .catch((err) => {
            console.log(err.response, "err");
          })
          .finally(() => {
            setEditRow(false);
            setItemLoading(false);
          });
      }
    };

    return editRow ? (
      <Formik
        initialValues={{ comment: "", [spentName]: String(spent) }}
        onSubmit={handleSpent}
      >
        {({ values }) => {
          const free = sum - calculate(data[spentName], values[spentName]);

          return (
            <Form>
              <div
                className={classNames(
                  classes.row,
                  classes.form,
                  itemLoading && classes.loading
                )}
              >
                <div className={classes.comment}>
                  <label htmlFor="comment">Comment:</label>
                  <Field
                    name={"comment"}
                    id={"comment"}
                    type={"text"}
                    autoFocus
                  />
                </div>

                <Field name={spentName} type={"text"} id={spentName} />
                <div className={classes.rowItem}>
                  {free || free === 0 ? free + "₴" : "Error"}
                </div>
                <div className={classes.rowItem}>{sum}₴</div>
                {getCostData && (
                  <div className={classes.buttons}>
                    <Button
                      name="✓"
                      size="short"
                      mainType="submit"
                      disabled={itemLoading || (!free && free !== 0)}
                    />
                    <Button
                      name="&times;"
                      type="cancel"
                      size="short"
                      onClick={() => setEditRow(false)}
                      disabled={itemLoading}
                    />
                  </div>
                )}
              </div>
            </Form>
          );
        }}
      </Formik>
    ) : (
      <React.Fragment>
        <div
          className={classNames(classes.row, itemLoading && classes.loading)}
        >
          <div className={classes.rowItem}>{name}</div>
          <div
            className={classes.rowItem}
            onDoubleClick={() => setEditRow(true)}
          >
            {spent}₴
          </div>

          <div className={classes.rowItem}>{sum - spent}₴</div>
          <div className={classes.rowItem}>{sum}₴</div>
          <div className={classes.editButton}>
            <Button
              name="+"
              size="short"
              onClick={() => {
                setShowComments(false);
                setEditRow(true);
              }}
              disabled={itemLoading}
            />
            {payments.length > 0 && withComments && (
              <Button
                name={"❮"}
                size="short"
                onClick={() => setShowComments(!showComments)}
                disabled={itemLoading}
                rotate={showComments ? 90 : -90}
              />
            )}
          </div>
        </div>
        {payments.length > 0 && showComments && (
          <div
            className={classNames(
              classes.row,
              classes.fullWidth,
              itemLoading && classes.loading
            )}
          >
            {/* <div className={classNames(classes.row, classes.comments)}>
              <div>Comment</div>
              <div>Sum</div>
              <div>Date</div>
              <div>Time</div>
            </div> */}
            {payments.map((el, i) => (
              <div className={classNames(classes.row, classes.comments)}>
                <div>{el.comment || "No comment"}</div>
                <div>{el.sum}₴</div>
                <div>{el.date}</div>
                <div>{el.time}</div>
              </div>
            ))}
          </div>
        )}
      </React.Fragment>
    );
  }

  return editRow ? (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values }) => (
        <Form>
          <div
            className={classNames(
              classes.row,
              classes.form,
              itemLoading && classes.loading
            )}
          >
            <Field lo className={classes.name} name={"name"} autoFocus />
            <Field name={"andrianSum"} />
            <Field name={"tanyaSum"} />
            <div className={classes.rowItem}>
              {Number(values.andrianSum) + Number(values.tanyaSum)}₴
            </div>
            {getCostData && (
              <div className={classes.buttons}>
                <Button
                  name="✓"
                  size="short"
                  mainType="submit"
                  disabled={itemLoading}
                />
                <Button
                  name="&times;"
                  type="cancel"
                  size="short"
                  onClick={() => setEditRow(false)}
                  disabled={itemLoading}
                />
              </div>
            )}
          </div>
        </Form>
      )}
    </Formik>
  ) : (
    <React.Fragment>
      <div className={classNames(classes.row, itemLoading && classes.loading)}>
        <div className={classes.rowItem}>{name}</div>
        <div className={classes.rowItem}>{andrianSum}₴</div>
        <div className={classes.rowItem}>{tanyaSum}₴</div>
        <div className={classes.rowItem}>{andrianSum + tanyaSum}₴</div>
        {withComments && payments.length && (
          <div className={classes.editButton}>
            <Button
              name={"❮"}
              size="short"
              onClick={() => setShowComments(!showComments)}
              disabled={itemLoading}
              rotate={showComments ? 90 : -90}
            />{" "}
          </div>
        )}
        {getCostData && (
          <div className={classes.editButton}>
            <Button
              name="✎"
              size="short"
              onClick={() => setEditRow(true)}
              disabled={itemLoading}
            />
            <Button
              name="&#128465;"
              size="short"
              type="cancel"
              onClick={() => handleRemove(_id)}
              disabled={itemLoading}
            />
          </div>
        )}
      </div>
      {payments.length > 0 && showComments && (
        <div
          className={classNames(
            classes.row,
            classes.fullWidth,
            itemLoading && classes.loading
          )}
        >
          {/* <div className={classNames(classes.row, classes.comments)}>
          <div>Comment</div>
          <div>Sum</div>
          <div>Date</div>
          <div>Time</div>
        </div> */}
          {payments.map((el, i) => (
            <div
              className={classNames(classes.row, classes.comments)}
              key={el._id}
            >
              <div>
                {el.user}:{el.comment || "No comment"}
              </div>
              <div>{el.sum}₴</div>
              <div>{el.date}</div>
              <div>{el.time}</div>
            </div>
          ))}
        </div>
      )}
    </React.Fragment>
  );
};

export default CostItem;
