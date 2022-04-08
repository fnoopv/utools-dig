import React, { useState, useEffect } from "react";
import { Form, Row, Col, Input, Button, Select, Empty, Table } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import "./App.css";

const { Option } = Select;

const App = () => {
  const [expand, setExpand] = useState(false);
  const [address, setAddress] = useState([]);
  const [queryValue, setQueryValue] = useState({})

  const reg = new RegExp('[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+')
  const [form] = Form.useForm();

  const defaultQuery = {
    domain: "",
    type: "A",
    dns: "114.114.114.114",
  };

  useEffect(() => {
    window.utools.onPluginEnter(({ code, type, payload }) => {
      console.log("用户进入插件", code, type, payload);
    });
  });

  const getFields = () => {
    const children = [
      <Col span={6} offset={4} key="type">
        <Form.Item name="type" label="记录类型">
          <Select>
            <Option value="A">A</Option>
            <Option value="AAAA">AAAA</Option>
            <Option value="CNAME">CNAME</Option>
            <Option value="NS">NS</Option>
            <Option value="PTR">PTR</Option>
            <Option value="TXT">TXT</Option>
          </Select>
        </Form.Item>
      </Col>,
      <Col span={8} key="dns">
        <Form.Item name="dns" label="DNS服务器">
          <Select>
            <Option value="114.114.114.114">114.114.114.114</Option>
            <Option value="119.29.29.29">119.29.29.29</Option>
            <Option value="223.5.5.5">223.5.5.5</Option>
            <Option value="8.8.8.8">8.8.8.8</Option>
            <Option value="1.1.1.1">1.1.1.1</Option>
          </Select>
        </Form.Item>
      </Col>,
    ];

    return children;
  };

  async function queryDomain(values) {
    setQueryValue(values);
    const result = await query(values);
    for (const val of result) {
      if (!(val.result instanceof Array)) {
        if (reg.test(val.result)) {
          const endResult = await query({domain: val.result, type: "A", dns: queryValue.dns})
          console.log("endResult: ", endResult)
          result.push(...endResult)
        } else {
          console.log("no match")
        }
      }
    }
    setAddress(result);
  }

  async function query(values) {
    const r2 =  await window.query(values);
    console.log("r2: ", r2)
    return r2;
  }

  const columns = [
    {
        title: "域名",
        dataIndex: "domain"
    },
    {
        title: "记录类型",
        dataIndex: "type"
    },
    {
        title: "记录值",
        dataIndex: "result"
    }
]

  const resultList = () => {
    return (
      <Table dataSource={address} columns={columns} rowKey={address.domain} pagination={false} size="small" />
    );
  };

  return (
    <div className="App">
      <Form
        form={form}
        name="dig"
        className="ant-advanced-search-form"
        onFinish={queryDomain}
        initialValues={defaultQuery}
      >
        <Row gutter={24}>
          <Col span={12} offset={6} key="domain">
            <div className="domainTitle">域名解析</div>
            <Form.Item
              name="domain"
              rules={[
                {
                  required: true,
                  message: "必须输入域名!",
                },
              ]}
            >
              <Input placeholder="输入域名" size="large" autoFocus />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>{getFields()}</Row>
        <Row>
          <Col
            span={24}
            style={{
              textAlign: "right",
            }}
          >
            <Button type="primary" htmlType="submit">
              解析
            </Button>
            <Button
              style={{
                margin: "0 8px",
              }}
              onClick={() => {
                form.resetFields();
              }}
            >
              重置
            </Button>
            <a
              style={{
                fontSize: 12,
              }}
              onClick={() => {
                setExpand(!expand);
                setAddress("");
              }}
            >
              {expand ? <UpOutlined /> : <DownOutlined />} 高级选项
            </a>
          </Col>
        </Row>
      </Form>
      <div className="queryResult">
        {address.length > 0 ? (
          resultList()
        ) : (
          <Empty description={<span>暂无解析</span>} />
        )}
      </div>
    </div>
  );
};

export default App;
