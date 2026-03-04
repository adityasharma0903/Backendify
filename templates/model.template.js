import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
/* __FIELDS__ */
    metadata: {
      createdBy: String,
      updatedBy: String,
      version: { type: Number, default: 1 }
    }
  },
  { 
    timestamps: true,
    collection: '__COLLECTION_NAME__'
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

const __MODEL_NAME__ = mongoose.model('__MODEL_NAME__', schema);

export default __MODEL_NAME__;
