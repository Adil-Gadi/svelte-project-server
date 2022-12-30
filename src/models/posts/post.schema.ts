import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from '@users/user.schema';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  author: User;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  edited: boolean;

  @Prop({
    required: true,
  })
  likes: string[];

  @Prop()
  createdAt: MongooseSchema.Types.Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.virtual('numberOfLikes').get(function () {
  return this.likes.length;
});
