import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    roll_no: Number,
    name: String,
    year: Number

});


const Student = mongoose.model("Student", studentSchema);

export default Student;