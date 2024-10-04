import json
import grpc
from concurrent import futures
import time
import nltk
from nltk.stem import WordNetLemmatizer
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
# Service gRPC
import protos.pb_pb2 as pb__pb2
import protos.pb_pb2_grpc as pb_pb2_grpc
# Load các thành phần của chatbot
nltk.download('punkt')
nltk.download('wordnet')
lemmatizer = WordNetLemmatizer()
model = load_model('/home/huythang/PycharmProjects/pythonProject/train/chatbot_model.h5')

# Load dữ liệu từ tệp intents.json
with open('/home/huythang/PycharmProjects/pythonProject/data/intents.json') as file:
    data = json.load(file)

# Khởi tạo biến words và classes từ dữ liệu intents
words = []
classes = []
documents = []
ignore_words = ['?', '!', '.', ',', '“', '”']

# Trích xuất dữ liệu từ intents.json
for category, intents in data.items():
    for intent in intents:
        for pattern in intent['question']:
            # Tokenize các từ trong mỗi pattern
            word_list = nltk.word_tokenize(pattern)
            words.extend(word_list)
            documents.append((word_list, intent['intent']))

            # Thêm tag vào classes nếu chưa có
            if intent['intent'] not in classes:
                classes.append(intent['intent'])

# Lemmatize và bỏ qua các từ không cần thiết
words = [lemmatizer.lemmatize(w.lower()) for w in words if w not in ignore_words]
# Loại bỏ các từ trùng lặp và sắp xếp lại danh sách
words = sorted(list(set(words)))

# Sắp xếp classes
classes = sorted(list(set(classes)))


# Hàm chatbot đã định nghĩa
def clean_up_sentence(sentence):
    sentence_words = nltk.word_tokenize(sentence)
    sentence_words = [lemmatizer.lemmatize(word.lower()) for word in sentence_words]
    return sentence_words


def bag_of_words(sentence):
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)  # Sử dụng biến words đã được khởi tạo
    for w in sentence_words:
        for i, word in enumerate(words):
            if word == w:
                bag[i] = 1
    return np.array(bag)



def predict_class(sentence):
    bow = bag_of_words(sentence)
    res = model.predict(np.array([bow]))[0]
    ERROR_THRESHOLD = 0.25
    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]

    results.sort(key=lambda x: x[1], reverse=True)
    return_list = []
    for r in results:
        return_list.append({'intent': classes[r[0]], 'probability': str(r[1])})
    return return_list


def get_response(intents_list, intents_json):
    if not intents_list:  # Nếu không có ý định nào được dự đoán
        return "Xin lỗi, tôi không hiểu câu hỏi của bạn."

    tag = intents_list[0]['intent']
    # Duyệt qua các ý định và trả về phản hồi tương ứng
    for category, intents in intents_json.items():
        for i in intents:
            if i['intent'] == tag:
                result = np.random.choice(i.get('responses', ["Xin lỗi, tôi không thể trả lời câu hỏi này."]))
                return result
    return "Xin lỗi, tôi không thể trả lời câu hỏi này."


class AIService(pb_pb2_grpc.AIServiceServicer):
    def ProcessAIRequest(self, request, context):
        # Lấy input từ gRPC request
        user_input = request.input_data

        # Dự đoán kết quả từ chatbot
        intents = predict_class(user_input)
        response = get_response(intents, data)

        # Tạo phản hồi gRPC
        return pb__pb2.AIResponse(success=True, message="Chatbot processed successfully", output_data=response)


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pb_pb2_grpc.add_AIServiceServicer_to_server(AIService(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("Server is running on port 50051...")
    try:
        while True:
            time.sleep(86400)  # Keep the server running
    except KeyboardInterrupt:
        server.stop(0)


if __name__ == '__main__':
    serve()
