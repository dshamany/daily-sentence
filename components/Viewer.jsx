import React, { useEffect, useState } from "react"
import { View, Text, TextInput, StyleSheet, Keyboard, TouchableWithoutFeedback, FlatList, SafeAreaView, TouchableOpacity, ScrollView } from "react-native"
import GestureRecognizer from 'react-native-swipe-gestures'

import Button from "./Button"

import { emotionStates } from "../other/constants"

import LocalStorage from '../other/data.json';

export default function Viewer() {

    const [isEditing, setIsEditing] = useState(false);
    const [isEditingText, setIsEditingText] = useState(false);

    const [isStatsView, setIsStatsView] = useState(false);
    const [isListView, setIsListView] = useState(false);

    const [current, setCurrent] = useState(0);

    const [textField, setTextField] = useState("");
    const [emotion, setEmotion] = useState(0);

    const maxCharCount = 128;

    const [data, setData] = useState([LocalStorage.root.data[0]]);

    function addEntry(obj) {
        let tmp = data;
        tmp[current] = obj;
        tmp.unshift({ lat: "", lon: "", date: new Date().toDateString(), sentence: "Tap and Hold to Add New Entry", emotion: 0, id: 0 });
        setData(tmp);
    }

    function updateEntry(obj) {
        let tmp = data;
        tmp[current] = obj;
        setData(tmp);
    }

    const emotionColor = (num) => {
        switch (num) {
            case 1:
                return "red";
            case 2:
                return "orange";
            case 3:
                return "#0099ff";
            case 4:
                return "lightgreen";
            case 5:
                return "yellow";
            default:
                return "white";
        }
    }

    function readView() {
        return (
            <View style={styles.viewerContainer}>
                <Button
                    style={styles.paginationButton}
                    title={current > 0 ? "\u1438" : " "}
                    titleStyle={styles.PaginationButtonText}
                    onPress={() => {
                        if (current > 0) setCurrent(current - 1);
                    }} />
                <GestureRecognizer
                    onSwipeRight={() => {
                        if (current > 0) setCurrent(current - 1);
                    }}
                    onSwipeLeft={() => {
                        if (current < data.length - 1) setCurrent(current + 1);
                    }}
                    onSwipeUp={() => setIsListView(true)}
                    onSwipeDown={() => setIsStatsView(true)}
                >
                    <TouchableWithoutFeedback onLongPress={() => {
                        setIsEditing(true);
                        if (current > 0) {
                            setTextField(data[current].sentence);
                            setEmotion(data[current].emotion);
                        }
                        else {
                            setTextField("");
                            setEmotion(0);
                        }
                    }}>
                        <View style={styles.middleView}>
                            <Text style={styles.sentenceView}>
                                {data[current].sentence}
                            </Text>
                            {
                                current > 0 &&
                                <Text style={{ ...styles.emotionEntry, color: emotionColor(data[current].emotion) }}>
                                    {emotionStates[data[current].emotion]}
                                </Text>
                            }
                        </View>
                    </TouchableWithoutFeedback>
                </GestureRecognizer>
                <Button
                    style={styles.paginationButton}
                    title={current < data.length - 1 ? '\u1433' : " "}
                    titleStyle={styles.PaginationButtonText}
                    onPress={() => {
                        if (current < data.length - 1) setCurrent(current + 1);
                    }} />
            </View>
        )
    }

    function editView() {
        return (
            <TouchableWithoutFeedback
                onPress={() => Keyboard.dismiss()}
                onLongPress={() => {
                    if (textField != "" || emotion > 0) {
                        let obj = {
                            id: current == 0 ? data.length : data[current].id,
                            date: new Date().toDateString(),
                            sentence: textField,
                            emotion: emotion
                        }

                        // sentence can't be "" && emotion can't be 0
                        current == 0 && emotion > 0 && textField != "" ? addEntry(obj) : current > 0 && updateEntry(obj);
                    }

                    setIsEditing(false);
                }}>
                <View style={styles.viewerContainer}>
                    <View style={styles.middleView}>
                        <TextInput
                            style={{ ...styles.sentenceView }}
                            onTouchStart={() => setIsEditingText(true)}
                            onEndEditing={() => setIsEditingText(false)}
                            onChangeText={(text) => setTextField(text)}
                            multiline
                            maxLength={maxCharCount}
                            placeholder="Edit Text  Select Emotion Tap and Hold"
                            placeholderTextColor="#777"
                        >
                            {textField}
                        </TextInput>
                        <Text style={[styles.charCountField, { color: (maxCharCount - textField.length) < 10 ? "#770000" : "#777" }]}>
                            ({maxCharCount - textField.length} characters remaining.)
                        </Text>
                        {!isEditingText &&
                            <View style={styles.viewerContainer}>
                                <Button
                                    title={emotion > 0 ? "\u1438" : "   "}
                                    titleStyle={styles.emotionSelect}
                                    onPress={() => {
                                        if (emotion > 0) {
                                            setEmotion(emotion - 1);
                                        }
                                    }} />
                                <Text style={{ ...styles.emotionEntry, color: emotionColor(emotion) }}>
                                    {emotionStates[emotion]}
                                </Text>
                                <Button
                                    title={emotion < emotionStates.length - 1 ? "\u1433" : "   "}
                                    titleStyle={styles.emotionSelect}
                                    onPress={() => {
                                        if (emotion < emotionStates.length - 1) {
                                            setEmotion(emotion + 1);
                                        }
                                    }} />
                            </View>
                        }
                        {
                            current > 0 && !isEditingText &&
                            <Button title="X"
                                titleStyle={{ ...styles.deleteBtn, fontSize: 20 }}
                                onPress={() => {
                                    let toDelete = current;
                                    setCurrent(current - 1);
                                    let tmp = data;
                                    tmp.splice(toDelete, 1);
                                    setData(tmp);
                                    setIsEditing(false);
                                }}
                            />
                        }
                    </View>
                </View>
            </TouchableWithoutFeedback >
        )

    }

    function statsView() {

        function calculateStats() {
            let stats = {};
            for (let entry of data) {
                if (stats[emotionStates[entry.emotion]] && entry.emotion)
                    stats[emotionStates[entry.emotion]] += 1
                else
                    stats[emotionStates[entry.emotion]] = 1;
            }

            return stats;
        }

        let stats = calculateStats();

        return (
            <View style={styles.viewerContainer}>
                <TouchableWithoutFeedback onPress={() => {
                    setIsStatsView(false);
                }}>
                    <View>
                        <View style={styles.rowView}>
                            <Text style={{ ...styles.bold, color: emotionColor(1) }}>{emotionStates[1]}</Text>
                            <Text style={{ color: "#fff", fontSize: 20 }}>{stats[emotionStates[1]] || 0}</Text>
                        </View>
                        <View style={styles.rowView}>
                            <Text style={{ ...styles.bold, color: emotionColor(2) }}>{emotionStates[2]}</Text>
                            <Text style={{ color: "#fff", fontSize: 20 }}>{stats[emotionStates[2]] || 0}</Text>
                        </View>
                        <View style={styles.rowView}>
                            <Text style={{ ...styles.bold, color: emotionColor(3) }}>{emotionStates[3]}</Text>
                            <Text style={{ color: "#fff", fontSize: 20 }}>{stats[emotionStates[3]] || 0}</Text>
                        </View>
                        <View style={styles.rowView}>
                            <Text style={{ ...styles.bold, color: emotionColor(4) }}>{emotionStates[4]}</Text>
                            <Text style={{ color: "#fff", fontSize: 20 }}>{stats[emotionStates[4]] || 0}</Text>
                        </View>
                        <View style={styles.rowView}>
                            <Text style={{ ...styles.bold, color: emotionColor(5) }}>{emotionStates[5]}</Text>
                            <Text style={{ color: "#fff", fontSize: 20 }}>{stats[emotionStates[5]] || 0}</Text>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        )
    }

    function listView() {
        return (
            <View style={styles.viewerContainer, { width: "100%", justifyContent: "center", alignItems: "center" }}>
                <GestureRecognizer centerContent onSwipeDown={() => {
                    setCurrent(0);
                    setIsListView(false);
                }}>
                    <ScrollView centerContent width="100%" height="100%" justifyContent="center">
                        {
                            data.length > 1 ? data.map((item, idx) =>
                                <TouchableOpacity key={item.id} onPress={() => {
                                    setCurrent(idx)
                                    setIsListView(false);
                                }}
                                >
                                    {
                                        idx > 0 &&
                                        <Text style={{ ...styles.sentenceView, color: "#777", margin: 10, textAlign: "center", width: "100%" }}>{item.date}</Text>
                                    }
                                </TouchableOpacity>
                            ) :
                                <TouchableOpacity onPress={() => {
                                    setIsListView(false);
                                }}>
                                    <Text style={styles.sentenceView}>No Items Available</Text>
                                    <Text style={styles.charCountField}>(Touch to Go Back)</Text>
                                </TouchableOpacity>
                        }
                    </ScrollView>
                </GestureRecognizer>
            </View>
        )

    }

    return isStatsView ? statsView() : isListView ? listView() : isEditing ? editView() : readView();
}

const styles = StyleSheet.create({
    viewerContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    middleView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: "50%"
    },
    sentenceView: {
        fontSize: 32,
        fontFamily: "monospace",
        textAlign: "center",
        color: "white",
        textAlignVertical: "center",
        width: 300,
    },
    bold: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white"
    },
    emotionEntry: {
        fontSize: 24,
        textAlign: "center",
        color: "#777",
        padding: 50,
        width: 200,
        textAlignVertical: "center"
    },
    emotionSelect: {
        color: "#999",
        fontSize: 20,
    },
    paginationButton: {
        padding: 10,
        width: 50,
        height: "50%",
    },
    PaginationButtonText: {
        flex: 1,
        color: "#555",
        fontSize: 30,
        textAlignVertical: "center",
        textAlign: "center",
    },
    charCountField: {
        fontSize: 18,
        margin: 10,
        color: "#555",
        textAlign: "center"
    },
    deleteBtn: {
        width: 100,
        height: 50,
        borderColor: "white",
        borderWidth: 1,
        borderRadius: 3,
        color: "white",
        padding: 10,
        textAlign: "center",
        textAlignVertical: "center",
        backgroundColor: "#770000"
    },
    btnText: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        textAlignVertical: "center",
    },
    rowView: {
        flex: 0.25,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: 320,
    }
});