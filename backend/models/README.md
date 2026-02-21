# CNN Model Directory

Bu klasör eğitilmiş CNN model dosyalarını içerir.

## Model Dosyası

Model dosyası `cnn_model.h5` (TensorFlow/Keras) veya `cnn_model.pth` (PyTorch) formatında olmalıdır.

Model dosyası yoksa, uygulama rule-based (kural tabanlı) sınıflandırma kullanacaktır.

## Model Eğitimi

Model eğitmek için `backend/utils/cnn_classifier.py` dosyasındaki `create_cnn_model` fonksiyonunu kullanabilirsiniz.
