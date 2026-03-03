import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    status: { type: String, trim: true },
    metadata: {
      createdBy: String,
      updatedBy: String,
      version: { type: Number, default: 1 }
    }
  },
  { 
    timestamps: true,
    collection: 'users'
  }
);

// ========== INDEXES ==========
schema.index({ createdAt: -1 });
schema.index({ updatedAt: -1 });

// ========== MIDDLEWARE ==========
// Auto-increment version on update
schema.pre('findByIdAndUpdate', function() {
  this.increment();
});

// ========== METHODS ==========
schema.methods.toJSON = function() {
  return {
    id: this._id,
    ...this.toObject(),
    _id: undefined,
    __v: undefined
  };
};

// ========== STATICS ==========
schema.statics.findByIdAndDelete = async function(id) {
  return this.findByIdAndRemove(id);
};

const User = mongoose.model('User', schema);

export default User;
