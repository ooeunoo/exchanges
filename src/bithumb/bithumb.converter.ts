import {
  DepositWithdrawalType,
  DepsoitState,
  ExchangeBalance,
  ExchangeDepositAddress,
  ExchangeDepositHistory,
  ExchangeMarket,
  ExchangeMarketPrice,
  ExchangeOrderHistory,
  ExchangeTicker,
  ExchangeWalletStatus,
  ExchangeWithdrawHistory,
  WithdrawState,
} from "@exchange/exchange.interface";
import {
  BithumbBalance,
  BithumbDepositAddress,
  BithumbDepositHistory,
  BithumbOrderHistory,
  BithumbTicker,
  BithumbWalletStatus,
  BithumbWithdrawHistory,
  IBithumbResponse,
} from "@bithumb/bithumb.interface";
import { toBigNumberString } from "@utils/number";

export const bithumbMarketTickerConverterKRW = (res: IBithumbResponse<BithumbTicker[]>): ExchangeTicker[] => {
  const data = res.data;
  delete data["date"];
  return Object.keys(data).map((currency) => {
    const target = data[currency];
    return {
      currency: currency.toUpperCase(),
      unit: "KRW",
      high: toBigNumberString(target.max_price),
      low: toBigNumberString(target.min_price),
      first: toBigNumberString(target.opening_price),
      last: toBigNumberString(target.closing_price),
    };
  });
};

export const bithumbMarketTickerConverterBTC = (res: IBithumbResponse<BithumbTicker[]>): ExchangeTicker[] => {
  const data = res.data;
  delete data["date"];
  return Object.keys(data).map((currency) => {
    const target = data[currency];
    return {
      currency: currency.toUpperCase(),
      unit: "BTC",
      high: toBigNumberString(target.max_price),
      low: toBigNumberString(target.min_price),
      first: toBigNumberString(target.opening_price),
      last: toBigNumberString(target.closing_price),
    };
  });
};

export const bithumbWalletStatusConverter = (data: IBithumbResponse<BithumbWalletStatus[]>): ExchangeWalletStatus[] => {
  const pdata = data.data;
  return pdata.map(({ currency, net_type, deposit_status, withdrawal_status }) => {
    return {
      currency: currency.toUpperCase(),
      network: net_type.toUpperCase(),
      deposit: deposit_status == 1,
      withdraw: withdrawal_status == 1,
    };
  });
};

export const bithumbBalanceConverter = (data: IBithumbResponse<BithumbBalance[]>): ExchangeBalance[] => {
  const pdata = data.data;
  const result: ExchangeBalance[] = [];
  Object.keys(pdata).forEach((key) => {
    if (key.startsWith("total_")) {
      const balance = pdata[key];
      if (parseFloat(balance) > 0) {
        const [, currency] = key.split("_");
        const lockedBalance = pdata[`in_use_${currency}`];
        result.push({
          currency: currency.toUpperCase(),
          balance: toBigNumberString(balance),
          lockedBalance: toBigNumberString(lockedBalance),
          avgBuyPrice: null,
        });
      }
    }
  });
  return result;
};

export const depositAddressesConverter = (data: IBithumbResponse<BithumbDepositAddress>): ExchangeDepositAddress => {
  const pdata = data.data;

  let address = pdata.wallet_address;
  let memo = null;

  const [wallet_address, destination_tag] = pdata.wallet_address.split("&");
  if (destination_tag != undefined) {
    address = wallet_address;
    memo = destination_tag.split("=")[1];
  }

  return {
    currency: pdata.currency,
    network: pdata.net_type,
    address,
    memo: memo,
  };
};

export const depositHistoryConverter = (data: IBithumbResponse<BithumbDepositHistory[]>): ExchangeDepositHistory[] => {
  const pdata = data.data;
  console.log(pdata);
  return pdata.map(({ order_currency, fee, amount, transfer_date }) => {
    return {
      type: DepositWithdrawalType.DEPOSIT,
      txId: "",
      currency: order_currency,
      amount: toBigNumberString(amount),
      fee: toBigNumberString(fee),
      state: WithdrawState.DONE.toString(),
      createdAt: transfer_date,
      confirmedAt: null,
    };
  });
};

export const withdrawHistoryConverter = (data: IBithumbResponse<BithumbWithdrawHistory[]>): ExchangeWithdrawHistory[] => {
  const pdata = data.data;

  return pdata.map(({ order_currency, fee, amount, transfer_date }) => {
    return {
      type: DepositWithdrawalType.WITHDRAWAL,
      txId: "",
      currency: order_currency,
      amount: toBigNumberString(amount),
      fee: toBigNumberString(fee),
      state: WithdrawState.DONE.toString(),
      createdAt: transfer_date,
      confirmedAt: null,
    };
  });
};

export const orderHistoryConverter = (data: IBithumbResponse<BithumbOrderHistory[]>): ExchangeOrderHistory[] => {
  const pdata = data.data;

  return pdata.map(({ order_currency, payment_currency, order_date, type, price, units }) => {
    return {
      currency: order_currency,
      unit: payment_currency,
      price: toBigNumberString(price),
      amount: toBigNumberString(units),
      side: type,
      fee: null,
      createdAt: parseInt(order_date),
    };
  });
};
