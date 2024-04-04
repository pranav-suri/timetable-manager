import { Elysia, t } from "elysia";
import {
    AcademicYear,
    Batch,
    Classroom,
    Department,
    Division,
    Subdivision,
    Subject,
    Teacher,
} from "../../database";
import { getSubjectTeachers } from "../../controllers";

const app = new Elysia({ prefix: "tables" })
    .get("/academicYears", async () => {
        return { academicYears: await AcademicYear.findAll() }; // TODO: add userId function
    })
    .get(
        "/subjects",
        async ({ query }) => {
            const { departmentId } = query;
            return {
                subjects: await Subject.findAll({
                    where: {
                        DepartmentId: departmentId, // TODO: add multi disc sub
                    },
                }),
            };
        },
        {
            query: t.Object({
                departmentId: t.Numeric(),
            }),
        },
    )
    .get(
        "/classrooms",
        async ({ query }) => {
            const { academicYearId } = query;
            return {
                classrooms: await Classroom.findAll({ where: { AcademicYearId: academicYearId } }),
            };
        },
        {
            query: t.Object({
                academicYearId: t.Numeric(),
            }),
        },
    )
    .get(
        "/teachers",
        async ({ query }) => {
            const { academicYearId } = query;
            return {
                teachers: await Teacher.findAll({
                    where: {
                        AcademicYearId: academicYearId,
                    },
                }),
            };
        },
        {
            query: t.Object({
                academicYearId: t.Numeric(),
            }),
        },
    )
    .get(
        "/subjectTeachers",
        async ({ query }) => {
            const { subjectId } = query;
            return { teachers: await getSubjectTeachers(subjectId) };
        },
        {
            query: t.Object({
                subjectId: t.Numeric(),
            }),
        },
    )
    .get(
        "/batches",
        async ({ query }) => {
            const { academicYearId } = query;
            return {
                batches: await Batch.findAll({
                    where: {
                        AcademicYearId: academicYearId,
                    },
                }),
            };
        },
        {
            query: t.Object({
                academicYearId: t.Numeric(),
            }),
        },
    )
    .get(
        "/divisions",
        async ({ query }) => {
            const { departmentId } = query;
            return {
                divisions: await Division.findAll({
                    where: {
                        DepartmentId: departmentId,
                    },
                }),
            };
        },
        {
            query: t.Object({
                departmentId: t.Numeric(),
            }),
        },
    )
    .get(
        "/subdivisions",
        async ({ query }) => {
            const { divisionId } = query;
            return {
                subdivisions: await Subdivision.findAll({
                    where: {
                        DivisionId: divisionId,
                    },
                }),
            };
        },
        {
            query: t.Object({
                divisionId: t.Numeric(),
            }),
        },
    )
    .get(
        "/departments",
        async ({ query }) => {
            const { batchId } = query;
            return {
                departments: await Department.findAll({
                    where: {
                        BatchId: batchId,
                    },
                }),
            };
        },
        {
            query: t.Object({
                batchId: t.Numeric(),
            }),
        },
    );

export default app;
export type GetTables = typeof app;
