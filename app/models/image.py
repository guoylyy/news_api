from app import db
from app.extensions import fs_store
from sqlalchemy_imageattach.entity import Image as im
from sqlalchemy_imageattach.entity import image_attachment, store_context
from sqlalchemy_imageattach.stores.fs import HttpExposedFileSystemStore, FileSystemStore

class Image(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    created_time = db.Column(db.DateTime)
    updated_time = db.Column(db.DateTime)
    name = db.Column(db.String(200))
    
    def to_dict(self):
        with store_context(fs_store):
            return dict(
                created_time = self.created_time.isoformat(),
                updated_time = self.updated_time.isoformat(),
                id = self.id
            )

class ImageStore(db.Model, im):
    __tablename__ = 'image_store'
    image_id = db.Column(db.Integer, db.ForeignKey('image.id'), primary_key=True)
    image = db.relationship('Image')


class MockImage(db.Model):
    __tablename__ = "mockimage"
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(500))

    def to_dict(self):
        return dict(
                url = self.url
            )


class MainPageImage(db.Model):
    __tablename__ = 'main_page_image'
    id = db.Column(db.Integer, primary_key=True)
    order = db.Column(db.Integer)
    name = db.Column(db.String(200))
    link = db.Column(db.String(500))
    news_id = db.Column(db.Integer)
    visiable = db.Column(db.Boolean)
    image = image_attachment('MainPageImageStore')

    def to_dict(self):
        with store_context(fs_store):
            return dict(
                id=self.id,
                order=self.order,
                name=self.name,
                link=self.link,
                news_id=self.news_id,
                visiable = self.visiable
                )

class MainPageImageStore(db.Model, im):
    __tablename__ = 'main_page_image_store'
    image_id = db.Column(db.Integer,db.ForeignKey('main_page_image.id'), primary_key=True)
    image = db.relationship('MainPageImage')
