const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema({
  name:        { type:String, required:true },
  academicYear:{ type:String, required:true },
  semester:    { type:Number, enum:[1,2] },
  programme:   { type:mongoose.Schema.Types.ObjectId, ref:'Programme' },
  level:       { type:Number, enum:[100,200,300,400,500,600] },
  items: [{
    name:        { type:String, required:true },
    amount:      { type:Number, required:true },
    isMandatory: { type:Boolean, default:true },
    description: String,
  }],
  totalAmount: { type:Number, required:true },
  currency:    { type:String, default:'GHS' },
  dueDate:     { type:Date },
  latePenaltyPercentage: { type:Number, default:5 },
  isActive:    { type:Boolean, default:true },
  university:  { type:mongoose.Schema.Types.ObjectId, ref:'University', required:true },
  createdBy:   { type:mongoose.Schema.Types.ObjectId, ref:'User' },
}, { timestamps: true });

feeStructureSchema.index({ name: 1, university: 1 }, { unique: true });

const feeBillSchema = new mongoose.Schema({
  student:      { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  feeStructure: { type:mongoose.Schema.Types.ObjectId, ref:'FeeStructure' },
  semester:     { type:mongoose.Schema.Types.ObjectId, ref:'Semester' },
  academicYear: { type:String, required:true },
  billNumber:   { type:String, unique:true, sparse:true },
  totalBilled:  { type:Number, required:true },
  totalPaid:    { type:Number, default:0 },
  balance:      { type:Number, default:0 },
  latePenalty:  { type:Number, default:0 },
  discount:     { type:Number, default:0 },
  currency:     { type:String, default:'GHS' },
  dueDate:      { type:Date },
  status: { type:String, enum:['unpaid','partial','paid','overdue','waived'], default:'unpaid' },
  payments: [{
    amount:       { type:Number, required:true },
    paidAt:       { type:Date, default:Date.now },
    method:       { type:String, enum:['bank','mobile_money','cash','online','cheque'] },
    reference:    String,
    receiptNumber:String,
    processedBy:  { type:mongoose.Schema.Types.ObjectId, ref:'User' },
    notes:        String,
  }],
  notes:        String,
  waivedBy:     { type:mongoose.Schema.Types.ObjectId, ref:'User' },
  waiveReason:  String,
  university:   { type:mongoose.Schema.Types.ObjectId, ref:'University', required:true },
}, { timestamps: true });

feeBillSchema.index({ billNumber: 1, university: 1 }, { unique: true });
feeBillSchema.index({ student: 1, academicYear: 1, university: 1 });

feeBillSchema.pre('save', function(next) {
  this.balance = Math.max(0, this.totalBilled + this.latePenalty - this.discount - this.totalPaid);
  if (this.totalPaid <= 0)         this.status = 'unpaid';
  else if (this.balance <= 0)      this.status = 'paid';
  else                              this.status = 'partial';
  if (!this.billNumber) {
    const rand = Math.random().toString(36).substring(2,8).toUpperCase();
    this.billNumber = `BILL-${new Date().getFullYear()}-${rand}`;
  }
  next();
});

feeBillSchema.index({ student:1, academicYear:1 });

module.exports = {
  FeeStructure: mongoose.model('FeeStructure', feeStructureSchema),
  FeeBill:      mongoose.model('FeeBill',      feeBillSchema),
};
