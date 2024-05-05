import React, { useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { TeacherResponse, TimetableResponse } from "../../../backend/api/routes/responseTypes";
import { fetchAndSet } from "../fetchAndSet";
import api from "../../";

type Teacher = TeacherResponse["teachers"][0];

interface TeacherAutocompleteProps {
    slotDatas: TimetableResponse["timetable"]["slots"][0]["SlotDatas"];
    slotDataIndex: number;
    updateTeacher: (teacher: Teacher | null, slotDataIndex: number) => void;
    setUpdate: (update: boolean) => void;
}

export function TeacherAutocomplete({
    slotDatas,
    slotDataIndex,
    updateTeacher,
    setUpdate,
}: TeacherAutocompleteProps) {
    const slotData = slotDatas![slotDataIndex];
    const currentTeacher = slotData.Teacher;
    const subjectId = slotData.Subject?.id;
    const slotId = slotData.SlotId;
    const [inputValue, setInputValue] = React.useState("");
    const [value, setValue] = React.useState<TeacherResponse["teachers"][0] | null>(
        currentTeacher ?? null,
    );

    const [availableTeachersData, setAvailableTeachersData] =
        React.useState<TeacherResponse | null>(null);

    useEffect(() => {
        if (!slotData || !subjectId) return;
        setValue(currentTeacher ?? null);
        fetchAndSet(
            setAvailableTeachersData,
            api.available.teachers.get({ query: { subjectId, slotId } }),
        );
    }, [currentTeacher, slotData, slotId, subjectId]);

    const subjectTeachers = availableTeachersData?.teachers ?? [];
    const allTeachers = subjectTeachers.concat(currentTeacher ?? []);
    return (
        <Autocomplete
            sx={{ margin: "5px" }}
            disablePortal
            autoHighlight
            value={value}
            onChange={(event, newValue) => {
                // TODO: Update teacher in database. Call parent function here
                setValue(newValue);
                updateTeacher(newValue, slotDataIndex);
                setUpdate(true);
            }}
            inputValue={inputValue} // CHANGE TO CURRENT TEACHER ONCE PARENT FUNCTION CALLBACK IS ADDED
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            options={allTeachers}
            getOptionLabel={(option) => option.teacherName}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => <TextField {...params} label="Teacher" />}
        />
    );
}
