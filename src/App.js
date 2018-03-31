import React, { Component } from 'react';
import './App.css';
// import { Form, List, Checkbox, Flex, Button, Card, Radio, InputItem, TextareaItem } from 'antd-mobile';
import { Form, List, Checkbox, Flex, Card, Radio, Input, message } from 'antd';
import { Button } from 'antd-mobile';

import qs from 'qs';
const CheckboxItem = Checkbox.CheckboxItem;
const AgreeItem = Checkbox.AgreeItem;
const FormItem = Form.Item;
const RadioItem = Radio.RadioItem;
const { TextArea } = Input;

class App extends Component {

    state = {
        width: '100%',
        id: '',
        wJ: {
            id: '',
            questionnaireName: '',
            questionnaireDesc: '',
            createPerson: '',
            createTime: '',
            titleArray: [{
                id: '',
                titleContent: '',
                questionArray: [{
                    id: '',
                    questionType: 1,
                    questionContent: '',
                    optionArray: [{
                        id: '',
                        optionContent: '',
                        answerContent: ''
                    }]
                }]
            }]

        }
    };
    componentDidMount() {
        let { id } = qs.parse(window.location.search.split('?')[1]);

        if (!id) {
            return
        };

        fetch("/hospitalCRM/questionnaire/callQuestionInfo.do", {
            headers: new Headers({
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json; charset=utf-8',
                Accept: 'application/json',
                credentials: 'include',
            }),
            method: 'POST',
            body: JSON.stringify({ id })
        })
            .then(res => res.json())
            .then(
                (result) => {
                    let wJ = result.data;
                    this.setState({
                        id, wJ, doneFlag: +wJ.doneFlag,
                        isLoaded: true,
                    })
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { id } = this.state;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                let answers;
                let options;
                let answerArr

                answers = values.answer;
                options = Object.values(values.options);
                answerArr = options.filter(option => {
                    let questId = option.questionId;
                    let answer = answers[questId];
                    // 过滤掉问题下没有选中的答案，同时赋值答案, 如果答案是数组，便利赋值
                    if (+option.type === 2) {
                        answer.map(item => {
                            if (option.optionId === item) {
                                option.answerContent = item;
                            }
                        })
                    } else if (+option.type === 1) {
                        if (option.optionId === answer) {
                            option.answerContent = answer;
                        }
                    } else {
                        option.answerContent = answer;
                        return true;
                    }
                    return option.answerContent;
                });

                fetch("/hospitalCRM/questionnaire/submitwjAnswer.do", {
                    headers: new Headers({
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json; charset=utf-8',
                        Accept: 'application/json',
                        credentials: 'include',
                    }),
                    method: 'POST',
                    body: JSON.stringify({ id, answerArr })
                })
                    .then(res => res.json())
                    .then(
                        (result) => {
                            if (!result.result) {
                                message.success('提交成功');
                                setTimeout(() => {
                                    window.location.reload();
                                }, 1500);
                            } else {
                                console.log(result)
                            }
                        },
                        // Note: it's important to handle errors here
                        // instead of a catch() block so that we don't swallow
                        // exceptions from actual bugs in components.
                        (error) => {
                            console.log(error)
                        }
                    )
            } else {
                console.log(err);
            }
        });
    }
    render() {

        const { error, isLoaded, items, wJ, doneFlag } = this.state;

        const { form } = this.props;
        const { getFieldDecorator, validateFieldsAndScroll, getFieldsError } = form;

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4, offset: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 14 },
            },
        };

        const getOption = (type, options, wjId, titleId, questId) => {
            const Option = options.map(option => {
                getFieldDecorator(`options[${option.id}]`, {
                    initialValue: {
                        questionnaireId: wjId,
                        titleId,
                        questionId: questId,
                        optionId: option.id,
                        type
                    }
                });
                const radioStyle = {
                    display: 'block',
                    padding: '6px',
                    whiteSpace: 'normal'
                };
                if (+type === 1) {
                    return (
                        <Radio style={radioStyle}
                            key={option.id}
                            value={option.id}>
                            {option.optionContent}
                        </Radio>
                    )
                } else {
                    return (
                        <Checkbox style={radioStyle}
                            key={option.id}
                            value={option.id}
                        >
                            {option.optionContent}
                        </Checkbox>
                    )
                }


            })
            const getAnswer = type => {
                switch (type) {
                    case 1:
                        return (
                            !!doneFlag
                                ? < Radio.Group disabled>
                                    {Option}
                                </Radio.Group >
                                : < Radio.Group >
                                    {Option}
                                </Radio.Group >
                        )
                    case 2:
                        return (
                            !!doneFlag
                                ? < Checkbox.Group disabled>
                                    {Option}
                                </Checkbox.Group >
                                : < Checkbox.Group >
                                    {Option}
                                </Checkbox.Group >
                        )
                    case 3:
                        return (
                            !!doneFlag ? < Input disabled /> : < Input />
                        )
                    case 4:
                        return (
                            !!doneFlag ? < TextArea disabled /> : < TextArea />
                        )

                    default:
                        break;
                }
            }
            const Answer = getAnswer(type);
            let answers = options.filter(item => item.answerContent);
            answers = Array.from(answers, (x) => x.answerContent);
            answers = +type === 2 ? answers : answers[0] ? answers[0] : '';
            return (
                <FormItem
                    {...formItemLayout}
                    label=""
                >
                    <div style={{ marginTop: '8px', marginLeft: '32px' }}>
                        {getFieldDecorator(`answer[${questId}]`, {
                            initialValue: answers,
                            rules: [{
                                required: true,
                                message: "请选择答案...",
                            }],
                        })(
                            getAnswer(type)
                        )}
                    </div>
                </FormItem>
            )
        };

        const getQuest = (quests, wjId, titleId) => {
            const Quest = quests.map((quest, index) => {
                return (
                    <div key={quest.id} style={{ marginLeft: '16px' }}>
                        <div>{+index + 1}.{quest.questionContent}</div>
                        {getOption(quest.questionType, quest.optionArray, wjId, titleId, quest.id)}
                    </div>
                )
            })
            return (
                <div>
                    {Quest}
                </div>
            )
        };
        // {getQuest(title.questionArray)}
        const Title = wJ.titleArray.map((title, index) => {
            return (
                <Card key={title.id} title={(+index + 1) + '.' + title.titleContent} className={'card'} bordered={false}
                    style={{ width: '96%', marginLeft: '2%' }}
                >
                    {wJ.id && getQuest(title.questionArray, wJ.id, title.id)}
                </Card>
            )
        });


        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <div>
                    <div style={{ borderBottom: '1px solid #e8e8e8' }}>
                        <p style={{ fontSize: 16, padding: '24px 14px', margin: 0, fontWeight: 600 }}>
                            {wJ.questionnaireName}
                        </p>
                        <p style={{ paddingLeft: 46 }}>
                            {wJ.questionnaireDesc}
                        </p>
                    </div>
                    <Form >
                        {Title}
                        <FormItem style={{ textAlign: 'center' }}>
                            <div style={{ width: '50%', marginTop: 16, display: 'inline-block' }}>

                                <Button className="cus-button" type="primary" onClick={this.handleSubmit} style={doneFlag ? { display: 'none' } : {display: 'block'}}>
                                    提交
                                </Button>
                            </div>
                        </FormItem>
                    </Form>
                </div>);
        }
    }
}

export default Form.create()(App);
