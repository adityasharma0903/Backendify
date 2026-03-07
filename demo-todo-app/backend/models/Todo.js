import mongoose from 'mongoose';

const TodoSchema = new mongoose.Schema(
  {
    completed: { type: Boolean, default: false, index: true },
    priority: { type: String, trim: true },
    title: { type: String, trim: true },
    // Metadata
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    metadata: {
      createdBy: mongoose.Schema.Types.ObjectId,
      updatedBy: mongoose.Schema.Types.ObjectId,
      version: { type: Number, default: 1 },
      tags: [String]
    }
  },
  {
    timestamps: true,
    collection: 'todos'
  }
);

// ============================================================
// INDEXES FOR PERFORMANCE
// ============================================================
TodoSchema.index({ createdAt: -1 });
TodoSchema.index({ updatedAt: -1 });
TodoSchema.index({ isActive: 1 });
TodoSchema.index({ isDeleted: 1, createdAt: -1 });

// ============================================================
// HOOKS
// ============================================================

TodoSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.metadata.version = (this.metadata.version || 0) + 1;
  }
  next();
});

// ============================================================
// QUERY HELPERS
// ============================================================

TodoSchema.query.active = function() {
  return this.find({ isActive: true, isDeleted: false });
};

// ============================================================
// STATIC METHODS
// ============================================================

TodoSchema.statics.findAllActive = async function(options = {}) {
  return this.find({ isActive: true, isDeleted: false })
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 100)
    .skip(options.skip || 0);
};

TodoSchema.statics.softDelete = async function(id) {
  return this.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
};

// ============================================================
// INSTANCE METHODS
// ============================================================

TodoSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Todo = mongoose.model('Todo', TodoSchema);

export default Todo;
