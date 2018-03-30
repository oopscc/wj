import React, { Component } from 'react';
import './App.css';
import { List, Checkbox, Flex } from 'antd-mobile';

const CheckboxItem = Checkbox.CheckboxItem;
const AgreeItem = Checkbox.AgreeItem;

class App extends Component {
    state = {
        error: null,
        isLoaded: false,
        items: []
    };
    componentDidMount() {
        fetch("http://api.map.baidu.com/telematics/v3/weather?location=嘉兴&output=json&ak=5slgyqGDENN7Sy7pw29IUvrZ", {
            headers: new Headers({
                'Access-Control-Allow-Origin': '*',
            }),
            mode: "no-cors",
        })
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        items: result.items
                    });
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
    onChange = (val) => {
        console.log(val);
    }
    render() {
        const data = [
            { value: 0, label: 'Ph.D.' },
            { value: 1, label: 'Bachelor' },
            { value: 2, label: 'College diploma' },
        ];
        const { error, isLoaded, items } = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <div>
                    <List renderHeader={() => 'CheckboxItem demo'}>
                        {data.map(i => (
                            <CheckboxItem key={i.value} onChange={() => this.onChange(i.value)}>
                                {i.label}
                            </CheckboxItem>
                        ))}
                        <CheckboxItem key="disabled" data-seed="logId" disabled defaultChecked multipleLine>
                            Undergraduate<List.Item.Brief>Auxiliary text</List.Item.Brief>
                        </CheckboxItem>
                    </List>

                    <Flex>
                        <Flex.Item>
                            <AgreeItem data-seed="logId" onChange={e => console.log('checkbox', e)}>
                                Agree <a onClick={(e) => { e.preventDefault(); alert('agree it'); }}>agreement</a>
                            </AgreeItem>
                        </Flex.Item>
                    </Flex>
                </div>);
        }
    }
}

export default App;
