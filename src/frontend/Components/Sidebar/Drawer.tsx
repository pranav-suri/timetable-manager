import { styled, useTheme } from "@mui/material/styles";
import { Drawer, Divider, IconButton } from "@mui/material";
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import {
    SubdivisionResponse,
    SubjectResponse,
    TeacherResponse,
    ClassroomResponse,
    TimetableResponse,
} from "../../../backend/api/routes/responseTypes";
import { fetchAndSet } from "../fetchAndSet";
import api from "../../index";
import { TeacherAutocomplete } from "./TeacherAutocomplete";
import { SubjectAutocomplete } from "./SubjectAutocomplete";
import { useEffect, useState } from "react";
import React from "react";
import { SubdivisionAutocomplete } from "./SubdivisionAutocomplete";
import { ClassroomAutocomplete } from "./ClassroomAutocomplete";
import { SlotDataClasses, SlotDataSubdivisions, Teacher } from "../../../backend/database";
import { Updater } from "use-immer";

export const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-start",
}));

export function DrawerRight({
    drawerwidth,
    handleDrawerClose,
    drawerState,
    setTimetable,
    selectedSlotIndex,
    timetableData,
    setSelectedSlotIndex,
}: {
    drawerwidth: number;
    handleDrawerClose: () => void;
    drawerState: boolean;
    setTimetable: Updater<TimetableResponse>;
    setSelectedSlotIndex: React.Dispatch<React.SetStateAction<number | null>>;
    selectedSlotIndex: number | null;
    timetableData: TimetableResponse | null;
}) {
    const [update, setUpdate] = useState(false);
    const [subjects, setSubjects] = useState<SubjectResponse>({ subjects: [] });
    const [subdivisions, setSubdivisions] = useState<SubdivisionResponse>({ subdivisions: [] });

    function updateSubject(subject: SubjectResponse["subjects"][0] | null, slotDataIndex: number) {
        if (!subject) return;
        setTimetable((draft) => {
            // TODO: #9 Total rewrite required, type errors embedded deep within code.
            draft!.timetable.slots[selectedSlotIndex!].SlotDatas![slotDataIndex].Subject! = subject;
            draft!.timetable.slots[selectedSlotIndex!].SlotDatas![slotDataIndex].Teacher! = null;
        });
    }

    function updateTeacher(teacher: TeacherResponse["teachers"][0] | null, slotDataIndex: number) {
        setTimetable((draft) => {
            draft!.timetable.slots[selectedSlotIndex!].SlotDatas![slotDataIndex].Teacher = teacher;
        });
    }

    function updateSubdivisions(
        subdivisions: SubdivisionResponse["subdivisions"] | [],
        slotDataIndex: number,
    ) {
        const slotDataSubdivisions = subdivisions.map((subdivision) => ({
            Subdivision: subdivision,
        })) as SlotDataSubdivisions[];
        setTimetable((draft) => {
            draft!.timetable.slots[selectedSlotIndex!].SlotDatas![
                slotDataIndex
            ].SlotDataSubdivisions = slotDataSubdivisions;
        });
    }

    function updateClassrooms(
        classrooms: ClassroomResponse["classrooms"] | [],
        slotDataIndex: number,
    ) {
        const slotDataClasses = classrooms.map((classroom) => ({
            Classroom: classroom,
        })) as SlotDataClasses[];
        setTimetable((draft) => {
            draft!.timetable.slots[selectedSlotIndex!].SlotDatas![slotDataIndex].SlotDataClasses =
                slotDataClasses;
        });
    }

    function updateSlotData(slotDataIndex: number) {
        console.log(
            timetableData!.timetable.slots[selectedSlotIndex!].SlotDatas![slotDataIndex].id,
        );
        const subjectId =
            timetableData!.timetable.slots[selectedSlotIndex!].SlotDatas![slotDataIndex].Subject
                ?.id;
        if (!subjectId) return;

        api.slotDatas.update
            .post({
                slotDataId:
                    timetableData!.timetable.slots[selectedSlotIndex!].SlotDatas![slotDataIndex].id,
                slotId: timetableData!.timetable.slots[selectedSlotIndex!].id,
                subjectId: subjectId,
                teacherId:
                    timetableData!.timetable.slots[selectedSlotIndex!].SlotDatas![slotDataIndex]
                        .Teacher?.id ?? null,
                subdivisionIds:
                    timetableData!.timetable.slots[selectedSlotIndex!].SlotDatas![
                        slotDataIndex
                    ].SlotDataSubdivisions!.map((subdivision) => subdivision.Subdivision!.id) ?? [],
                classroomIds:
                    timetableData!.timetable.slots[selectedSlotIndex!].SlotDatas![
                        slotDataIndex
                    ].SlotDataClasses!.map((classroom) => classroom.Classroom!.id) ?? [],
            })
            .then(({ data }) => {
                const slotDataId = data!.slotData.id;
                setTimetable((draft) => {
                    draft!.timetable.slots[selectedSlotIndex!].SlotDatas![slotDataIndex].id =
                        slotDataId;
                });
            });
    }
    const slot = timetableData?.timetable.slots[selectedSlotIndex!];
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const slotDatas =
        slot?.SlotDatas?.filter((slotData) => slotData.Subject?.id !== 0) || ([] as SlotDatas[]);

    useEffect(() => {
        if (!update) return;
        slotDatas?.forEach((_, index) => {
            updateSlotData(index);
        });
        setUpdate(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [update]);

    useEffect(() => {
        // This has to be changed, department can divisionId must come from props or somewhere
        fetchAndSet(setSubjects, api.departments({ id: 2 }).subjects.get());
        fetchAndSet(setSubdivisions, api.divisions({ id: 2 }).subdivisions.get());
    }, []);

    useEffect(() => {
        if (!selectedSlotIndex) return;
        setTimetable((draft) => {
            if (!draft?.timetable) return;
            draft!.timetable!.slots[selectedSlotIndex!].SlotDatas = [
                ...slotDatas,
                {
                    id: 0,
                    SlotId: slot?.id,
                    SlotDataClasses: [],
                    SlotDataSubdivisions: [],
                    Subject: { id: 0, subjectName: "" },
                    Teacher: { id: null, teacherName: "" },
                },
            ];
        });
        return () =>
            setTimetable((draft) => {
                if (!draft?.timetable) return;
                draft!.timetable!.slots[selectedSlotIndex!].SlotDatas = slotDatas;
            });
    }, [selectedSlotIndex, setTimetable, slot?.id, slotDatas, timetableData]);

    const theme = useTheme();
    if (!slot || !timetableData) return null;

    return (
        <Drawer
            sx={{
                width: drawerwidth,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: drawerwidth,
                },
            }}
            variant="persistent"
            anchor="right"
            open={drawerState}
        >
            <DrawerHeader>
                <IconButton
                    onClick={() => {
                        handleDrawerClose();
                        setSelectedSlotIndex(null);
                    }}
                >
                    {theme.direction === "rtl" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
            </DrawerHeader>
            Day: {slot.day}, Slot: {slot.number}
            <Divider />
            {slot.SlotDatas!.map((slotData, index) => (
                <React.Fragment key={index}>
                    <SubjectAutocomplete
                        subjects={subjects.subjects}
                        slotDatas={slot.SlotDatas}
                        slotDataIndex={index}
                        updateSubject={updateSubject}
                        setUpdate={setUpdate}
                    />
                    <TeacherAutocomplete
                        slotDatas={slot.SlotDatas}
                        slotDataIndex={index}
                        updateTeacher={updateTeacher}
                        setUpdate={setUpdate}
                    />
                    <ClassroomAutocomplete
                        slotDatas={slot.SlotDatas}
                        slotDataIndex={index}
                        updateClassrooms={updateClassrooms}
                        setUpdate={setUpdate}
                    />
                    <SubdivisionAutocomplete
                        slotDatas={slot.SlotDatas}
                        slotDataIndex={index}
                        subdivisions={subdivisions.subdivisions}
                        updateSubdivisions={updateSubdivisions}
                        setUpdate={setUpdate}
                    />
                    <Divider sx={{ margin: "20px" }} />
                </React.Fragment>
            ))}
        </Drawer>
    );
}
