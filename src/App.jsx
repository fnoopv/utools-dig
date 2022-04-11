import React, { useState, useEffect } from "react";
import { Form, Row, Col, Input, Button, Select, Empty, Table, message } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { CopyToClipboard } from "react-copy-to-clipboard";
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
    dns: ["114.114.114.114"],
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
          <Select mode="multiple" allowClear placeholder="选择DNS服务器">
            <Option key="114.114.114.114">114.114.114.114</Option>
            <Option key="119.29.29.29">119.29.29.29</Option>
            <Option key="223.5.5.5">223.5.5.5</Option>
            <Option key="8.8.8.8">8.8.8.8</Option>
            <Option key="1.1.1.1">1.1.1.1</Option>
          </Select>
        </Form.Item>
      </Col>,
    ];

    return children;
  };

  async function queryDomain(values) {
    setQueryValue(values);
    const result = await query(values);
    if (result.msg.length > 0) {
      message.error(result.msg, 3)
      setAddress([])
    } else if (result.data.length === 0) {
      message.info("没有相关解析记录", 3)
      setAddress([])
    } else {
      for (const val of result.data) {
        if (!(val.result instanceof Array)) {
          if (reg.test(val.result)) {
            const endResult = await query({ domain: val.result, type: "A", dns: queryValue.dns })
            result.data.push(...endResult.data)
          }
        }
      }
      setAddress(result.data);
    }
  }

  async function query(values) {
    const r2 = await window.query(values);
    return r2;
  }

  const columns = [
    {
      title: "域名",
      key: "domain",
      dataIndex: "domain"
    },
    {
      title: "记录类型",
      key: "type",
      dataIndex: "type"
    },
    {
      title: "记录值",
      key: "result",
      dataIndex: "result"
    },
    {
      title: "操作",
      key: "action",
      render: (text, record) => (
          <CopyToClipboard text={text.result}
            onCopy={() => message.success(`${text.result} 已复制~`, 3)}>
            <a>复制</a>
          </CopyToClipboard>
      ),
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
                {
                  pattern: /[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/,
                  message: "域名格式不正确"
                }
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
                setAddress([]);
                setQueryValue([]);
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
