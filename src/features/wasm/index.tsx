import { Button, Form, Input, Upload, message } from "antd";
import { FC, useEffect, useState } from "react";
import { RcFile } from "antd/es/upload";

import Client from "WasmLoader/Client";
import WasmLoader from "WasmLoader";

import css from "./wasm.module.css";

const loader = new WasmLoader();
const client = new Client("excelClient");

export const Wasm: FC = () => {
  const [loaded, setLoaded] = useState(false);
  const [readValue, setReadValue] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!loaded) {
      loader.runWasm("/go/main.wasm", client).then(() => setLoaded(true));
    }
  }, [loaded]);

  const handleLoadExcel = (file: RcFile) => {
    const reader = new FileReader();

    reader.onloadend = (evt) => {
      if (evt.target?.readyState === FileReader.DONE) {
        if (evt.target.result instanceof ArrayBuffer) {
          const buf = new Uint8Array(evt.target.result);
          client.loadExcel(buf, buf.length);
        }
      }
    };

    reader.readAsArrayBuffer(file);

    return false;
  };

  const handleFinishRead = (values: { cell: string; sheet: string }) => {
    const value = client.getCellValue(values.sheet, values.cell);
    setReadValue(value);
  };

  const handleFinishSet = (values: {
    cell: string;
    sheet: string;
    value: string;
  }) => {
    const res = client.setCellValue(values.sheet, values.cell, values.value);
    if (res) {
      messageApi.info("Ячейка обновлена");
    }
  };

  const handleDownloadExcel = () => {
    const size = client.getExcelSize();
    const buf = new Uint8Array(size);

    client.getExcel(buf);
    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    window.open(url, "_target");
  };

  return (
    <div className={css.wrapper}>
      <h3>Excel wasm GO</h3>
      {loaded && (
        <>
          <Upload beforeUpload={handleLoadExcel} multiple={false}>
            <Button>Загрузить excel</Button>
          </Upload>
          <Form
            className={css.form}
            labelCol={{ span: 8 }}
            onFinish={handleFinishRead}
          >
            <Form.Item label="Лист" name="sheet">
              <Input />
            </Form.Item>
            <Form.Item label="Ячейка" name="cell">
              <Input />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit">Read</Button>
            </Form.Item>
            <Form.Item>{readValue}</Form.Item>
          </Form>
          <Form
            className={css.form}
            labelCol={{ span: 8 }}
            onFinish={handleFinishSet}
          >
            <Form.Item label="Лист" name="sheet">
              <Input />
            </Form.Item>
            <Form.Item label="Ячейка" name="cell">
              <Input />
            </Form.Item>
            <Form.Item label="Значение" name="value">
              <Input />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit">Set</Button>
            </Form.Item>
          </Form>
          <Button onClick={handleDownloadExcel} type="primary">
            Скачать excel
          </Button>
        </>
      )}
      {contextHolder}
    </div>
  );
};
