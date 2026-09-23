import type { VocabularyItem } from "../App";

export const TOPICS_DATA: Record<string, VocabularyItem[]> = {
  'Giao tiếp công sở': [
    { id: 'office-1', word: 'Meeting', phonetic: '/ˈmiːtɪŋ/', meaning: 'Cuộc họp', example: 'We have a meeting at 10 AM.', exampleMeaning: 'Chúng ta có cuộc họp lúc 10 giờ sáng.', example2: 'The meeting was very productive.', example2Meaning: 'Cuộc họp rất hiệu quả.' },
    { id: 'office-2', word: 'Deadline', phonetic: '/ˈdɛdlaɪn/', meaning: 'Hạn chót', example: 'I need to meet the deadline.', exampleMeaning: 'Tôi cần hoàn thành đúng hạn chót.', example2: 'The deadline is next Friday.', example2Meaning: 'Hạn chót là thứ Sáu tuần sau.' },
    { id: 'office-3', word: 'Colleague', phonetic: '/ˈkɒliːɡ/', meaning: 'Đồng nghiệp', example: 'My colleagues are very helpful.', exampleMeaning: 'Đồng nghiệp của tôi rất hay giúp đỡ.', example2: 'I had lunch with a colleague.', example2Meaning: 'Tôi đã ăn trưa với một người đồng nghiệp.' },
    { id: 'office-4', word: 'Project', phonetic: '/ˈprɒdʒɛkt/', meaning: 'Dự án', example: 'We are working on a new project.', exampleMeaning: 'Chúng tôi đang làm một dự án mới.', example2: 'The project is almost finished.', example2Meaning: 'Dự án gần như đã hoàn thành.' },
    { id: 'office-5', word: 'Feedback', phonetic: '/ˈfiːdbæk/', meaning: 'Phản hồi', example: 'I appreciate your feedback.', exampleMeaning: 'Tôi rất trân trọng phản hồi của bạn.', example2: 'Positive feedback motivates the team.', example2Meaning: 'Phản hồi tích cực tạo động lực cho nhóm.' },
  ],
  'Đời sống hàng ngày': [
    { id: 'daily-1', word: 'Breakfast', phonetic: '/ˈbrɛkfəst/', meaning: 'Bữa sáng', example: 'I usually have eggs for breakfast.', exampleMeaning: 'Tôi thường ăn trứng vào bữa sáng.', example2: 'Breakfast is the most important meal.', example2Meaning: 'Bữa sáng là bữa ăn quan trọng nhất.' },
    { id: 'daily-2', word: 'Exercise', phonetic: '/ˈɛksəsaɪz/', meaning: 'Tập thể dục', example: 'I exercise every morning.', exampleMeaning: 'Tôi tập thể dục mỗi sáng.', example2: 'Exercise is good for your health.', example2Meaning: 'Tập thể dục rất tốt cho sức khỏe.' },
    { id: 'daily-3', word: 'Grocery', phonetic: '/ˈɡroʊsəri/', meaning: 'Cửa hàng tạp hóa', example: 'I need to buy some groceries.', exampleMeaning: 'Tôi cần mua một số đồ tạp hóa.', example2: 'The grocery store is closed.', example2Meaning: 'Cửa hàng tạp hóa đã đóng cửa.' },
    { id: 'daily-4', word: 'Laundry', phonetic: '/ˈlɔːndri/', meaning: 'Giặt ủi', example: 'I do the laundry on weekends.', exampleMeaning: 'Tôi giặt quần áo vào cuối tuần.', example2: 'The laundry is still wet.', example2Meaning: 'Quần áo giặt vẫn còn ướt.' },
    { id: 'daily-5', word: 'Relax', phonetic: '/rɪˈlæks/', meaning: 'Thư giãn', example: 'I like to relax on the sofa.', exampleMeaning: 'Tôi thích thư giãn trên ghế sofa.', example2: 'Listening to music helps me relax.', example2Meaning: 'Nghe nhạc giúp tôi thư giãn.' },
  ]
};
