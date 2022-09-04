import classNames from "classnames";
import React, { useState } from "react";
import { InUseType } from "../../App";
import Button from "../button/button.component";
import InfoItem from "../infoItem/infoItem.component";
import classes from "./credit.module.scss";

type CreditProps = {
  myInfo: InUseType;
  type?: "history" | "inUse";
  loading?: boolean;
};

const Credit: React.FC<CreditProps> = ({ myInfo, type, loading }) => {
  const [showPayments, setShowPayments] = useState(false);

  return (
    <div className={classes.credit}>
      <div className={classes.infoContainer}>
        {type === "inUse" && (
          <InfoItem
            name="User"
            loading={loading}
            value={myInfo.name || myInfo.email}
          />
        )}
        <InfoItem name="Sum" loading={loading} value={myInfo.sum + "₴"} />
        <InfoItem
          name="Month count"
          loading={loading}
          value={myInfo.monthCount}
        />
        <InfoItem
          name="Overpayment"
          loading={loading}
          value={Math.ceil(myInfo.overpayment) + "₴"}
        />
        <InfoItem
          name="Payment per month"
          loading={loading}
          value={myInfo.paymentPerMonth + "₴"}
        />
        {type !== "history" && (
          <>
            <InfoItem
              name={"Enter"}
              loading={loading}
              value={myInfo.sum + myInfo.overpayment - myInfo.remains + "₴"}
            />
            <InfoItem
              name={"Remains"}
              loading={loading}
              value={myInfo.remains + "₴"}
            />
          </>
        )}

        <InfoItem name="Date" loading={loading} value={myInfo.date} />
      </div>

      {myInfo.payments.length ? (
        <>
          {showPayments && (
            <div className={classes.payments}>
              <div className={classes.row}>
                <div>Date</div>
                <div>Time</div>
                <div>Sum</div>
                <div>Remaind</div>
              </div>
              {myInfo.payments.reverse().map((el, i) => (
                <div
                  className={classNames(
                    classes.row,
                    loading && classes.loading
                  )}
                >
                  <div>{el.date}</div>
                  <div>{el.time}</div>
                  <div>{el.sum}₴</div>
                  <div>{el.remains}₴</div>
                </div>
              ))}
            </div>
          )}
          <Button
            name={showPayments ? "Hide" : "Show payments"}
            size={"small"}
            type={showPayments ? "cancel" : "submit"}
            onClick={() => setShowPayments(!showPayments)}
          />
        </>
      ) : null}
    </div>
  );
};

export default Credit;
