                const TELEGRAM_BOT_TOKEN = "7620828622:AAErd9r31jItLObJFwQxRmlAVJefGaWz5i4";
                const CHAT_IDS = ["6642768517"];

                const form = document.getElementById('healthForm');
                const adviceContainer = document.getElementById('adviceContainer');
                const adviceContent = document.getElementById('adviceContent');
                const statusMessage = document.getElementById('statusMessage');

                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    statusMessage.textContent = 'Đang gửi dữ liệu...';
                    statusMessage.className = 'mt-4 text-center text-sm font-medium text-blue-600';

                    const formData = new FormData(form);
                    const data = {};

                    // Ghi dữ liệu tiếng Việt đầy đủ
                    data['⏰ Dấu thời gian'] = new Date().toLocaleString('vi-VN', {
                        year: 'numeric', month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                        hour12: false
                    });

                    data['Hôm nay cảm thấy thế nào'] = formData.get('feelings') || '';
                    data['Lượng kinh nguyệt'] = formData.get('menstrualFlow') || '';
                    data['Cân nặng (kg)'] = formData.get('weight') || '';
                    data['Thuốc tránh thai đường uống (OC)'] = formData.get('ocp') || '';
                    data['Thuốc ngoài'] = formData.get('medication') || '';

                    // Mapping field -> tên tiếng Việt
                    const fieldLabels = {
                        moods: 'Tâm trạng',
                        symptoms: 'Triệu chứng',
                        digestion: 'Tiêu hóa và chất thải',
                        other: 'Khác',
                        exercise: 'Hoạt động thể chất',
                        sexualActivity: 'Hoạt động tình dục và nhu cầu tình dục',
                        vaginalDischarge: 'Tiết dịch âm đạo',
                        ovulationSigns: 'Dấu hiệu rụng trứng'
                    };

                    Object.keys(fieldLabels).forEach(field => {
                        data[fieldLabels[field]] = Array.from(formData.getAll(field)).join(', ') || '';
                    });

                    // Tạo lời khuyên
                    const advice = generateAdvice(data);

                    // Format dữ liệu để gửi Telegram
                    let message = "📝 *Cập nhật Sức khỏe mới nhất:*\n\n";
                    for (const key in data) {
                        if (data[key]) {
                            message += `- *${key}*: ${data[key]}\n`;
                        }
                    }
                    message += `\n💡 *Lời khuyên và giải pháp:*\n${advice}`;

                    try {
                        // Gửi đến tất cả chat ID
                        for (const chatId of CHAT_IDS) {
                            const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
                            const payload = {
                                chat_id: chatId,
                                text: message,
                                parse_mode: "Markdown"
                            };

                            const response = await fetch(telegramUrl, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload)
                            });

                            if (!response.ok) {
                                const errorData = await response.json();
                                throw new Error();
                            }
                        }

                        // ✅ Hiển thị trên web cho người dùng
                        let htmlResult = "<h4 class='font-semibold text-purple-700 mb-2'>Kết quả ghi nhận hôm nay:</h4>";
                        htmlResult += "<ul class='list-disc pl-5 space-y-1 text-gray-700'>";
                        for (const key in data) {
                            if (data[key]) {
                                htmlResult += `<li><strong>${key}:</strong> ${data[key]}</li>`;
                            }
                        }
                        htmlResult += "</ul>";
                        htmlResult += `<h4 class='font-semibold text-purple-700 mt-4 mb-2'>💡 Lời khuyên:</h4><p>${advice.replace(/\n/g, "<br>")}</p>`;

                        adviceContent.innerHTML = htmlResult;
                        adviceContainer.classList.remove('hidden');

                        statusMessage.textContent = '✅ Gửi dữ liệu thành công!';
                        statusMessage.className = 'mt-4 text-center text-sm font-medium text-green-600';

                    } catch (error) {
                        console.error("", error);
                        statusMessage.textContent = ``;
                    }
                });


                // Hàm sinh lời khuyên và giải pháp hoàn chỉnh
       function generateAdvice(rowData) {
          let advice = "";
          function addAdvice(condition, message) {
              if (condition) advice += `- ${message}\n`;
          }

          const moods = (rowData['Tâm trạng'] || "").split(',').map(m => m.trim());
          const symptoms = (rowData['Triệu chứng'] || "").split(',').map(s => s.trim());
          const digestion = (rowData['Tiêu hóa và chất thải'] || "").split(',').map(d => d.trim());
          const exercise = (rowData['Hoạt động thể chất'] || "").split(',').map(e => e.trim());
          const ovulationSigns = (rowData['Dấu hiệu rụng trứng'] || "").split(',').map(o => o.trim());
          const sexual = (rowData['Hoạt động tình dục và nhu cầu tình dục'] || "").split(',').map(s => s.trim());
          // Lấy dữ liệu tiết dịch âm đạo đúng cách
          const vaginalDischargeData = (rowData['Tiết dịch âm đạo'] || "").split(',').map(v => v.trim());

          // 🎯 Cảm giác chung
          addAdvice(rowData['Hôm nay cảm thấy thế nào'] === "Tốt", "Bạn đang có một ngày tốt lành, hãy tận hưởng nó!");
          addAdvice(rowData['Hôm nay cảm thấy thế nào'] === "Bình thường", "Cơ thể bạn đang ổn định, hãy duy trì lối sống lành mạnh.");
          addAdvice(rowData['Hôm nay cảm thấy thế nào'] === "Không tốt", "Bạn đang cảm thấy không khỏe, hãy nghỉ ngơi và theo dõi thêm.");

          // 🎯 Triệu chứng
          symptoms.forEach(s => {
              if (s === "Mọi thứ đều ổn") {
                  addAdvice(false, "Tuyệt vời! Hãy tiếp tục duy trì lối sống lành mạnh.");
              }
              if (s === "Chuột rút") {
                  addAdvice(true, "Hãy thử chườm ấm hoặc massage nhẹ để giảm đau bụng.");
              }
              if (s === "Sưng đau ngực") {
                  addAdvice(true, "Có thể do thay đổi nội tiết, nếu kéo dài hãy tham khảo bác sĩ.");
              }
              if (s === "Đau đầu") {
                  addAdvice(true, "Uống đủ nước và nghỉ ngơi, hạn chế tiếp xúc ánh sáng mạnh.");
              }
              if (s === "Mụn") {
                  addAdvice(true, "Chú ý vệ sinh da mặt và hạn chế đồ ăn dầu mỡ.");
              }
              if (s === "Đau lưng") {
                  addAdvice(true, "Kéo giãn cơ và giữ tư thế đúng khi ngồi.");
              }
              if (s === "Mệt mỏi") {
                  addAdvice(true, "Nghỉ ngơi hợp lý và bổ sung thực phẩm giàu năng lượng.");
              }
              if (s === "Thèm ăn") {
                  addAdvice(true, "Hãy ưu tiên thực phẩm lành mạnh như trái cây, hạt, rau xanh thay vì đồ ngọt và dầu mỡ.");
              }
              if (s === "Mất ngủ") {
                  addAdvice(true, "Thư giãn trước khi ngủ, tránh dùng điện thoại quá nhiều.");
              }
              if (s === "Đau bụng") {
                  addAdvice(true, "Hãy thử chườm ấm, nghỉ ngơi và uống đủ nước. Nếu đau kéo dài hãy tham khảo ý kiến bác sĩ.");
              }
              if (s === "Ngứa âm đạo" || s === "Khô âm đạo") {
                  addAdvice(true, "Có thể là dấu hiệu nhiễm khuẩn hoặc thay đổi nội tiết, nếu kéo dài hãy đi khám phụ khoa.");
              }
          });

          // 🎯 Tâm trạng
          moods.forEach(m => {
              if (["Buồn", "Trầm cảm", "Lo lắng"].includes(m)) {
                  addAdvice(true, "Nếu cảm giác này kéo dài, hãy tìm sự hỗ trợ từ chuyên gia tâm lý.");
              }
              if (m === "Thiếu năng lượng") {
                  addAdvice(true, "Hãy chú ý ngủ đủ giấc và ăn uống đầy đủ dinh dưỡng.");
              }
              if (m === "Bực bội" || m === "Căng thẳng") {
                  addAdvice(true, "Hãy thử thiền hoặc tập thở để giảm stress.");
              }
              if (m === "Cảm thấy có lỗi") {
                  addAdvice(true, "Hãy học cách tha thứ cho bản thân, ai cũng có lúc mắc sai lầm.");
              }
              if (m === "Rất hay tự trách mình") {
                  addAdvice(true, "Thay vì trách bản thân, hãy tập trung vào cách cải thiện tình huống.");
              }
              if (m === "Suy nghĩ ám ảnh") {
                  addAdvice(true, "Hãy thử viết nhật ký hoặc chia sẻ với người tin tưởng.");
              }
              if (m === "Bối rối") {
                  addAdvice(true, "Hãy dành thời gian tạm dừng, sắp xếp lại suy nghĩ và ưu tiên việc quan trọng.");
              }
              if (m === "Lãnh đạm") {
                  addAdvice(true, "Thử làm một hoạt động mới mẻ để tìm lại hứng thú.");
              }
              if (["Bình tĩnh", "Vui vẻ", "Mạnh mẽ", "Phấn chấn"].includes(m)) {
                  addAdvice(false, "Hãy tiếp tục duy trì năng lượng tích cực này!");
              }
          });

          // 🎯 Tiêu hóa và chất thải
          digestion.forEach(d => {
              if (d === "Bình thường") {
                  addAdvice(false, "Hệ tiêu hóa hoạt động tốt, hãy tiếp tục duy trì chế độ ăn uống lành mạnh.");
              }
              if (d === "Buồn nôn") {
                  addAdvice(true, "Hãy nghỉ ngơi, uống nước ấm từng ngụm nhỏ và tránh thức ăn nhiều dầu mỡ.");
              }
              if (d === "Đầy hơi") {
                  addAdvice(true, "Hạn chế đồ uống có ga và ăn chậm nhai kỹ.");
              }
              if (d === "Táo bón") {
                  addAdvice(true, "Uống nhiều nước và bổ sung chất xơ.");
              }
              if (d === "Tiêu chảy") {
                  addAdvice(true, "Bổ sung nước, oresol để tránh mất nước.");
              }
          });

          // 🎯 Kinh nguyệt
          if (rowData['Lượng kinh nguyệt'] === "Bình thường") { addAdvice(false, "Kinh nguyệt ổn định, hãy duy trì chế độ ăn uống và nghỉ ngơi hợp lý."); }
          if (rowData['Lượng kinh nguyệt'] === "Nhiều") addAdvice(true, "Nếu ra máu nhiều, hãy bổ sung sắt và theo dõi tình trạng.");
          if (rowData['Lượng kinh nguyệt'] === "Ít") addAdvice(true, "Theo dõi chu kỳ tiếp theo, nếu bất thường hãy đi khám.");
          if (rowData['Lượng kinh nguyệt'] === "Cục máu đông") addAdvice(true, "Nếu có cục máu đông lớn, nên tham khảo bác sĩ.");

          // 🎯 Hoạt động thể chất
          if (exercise.includes("Không tập")) {
              addAdvice(true, "Hãy vận động nhẹ như đi bộ để cơ thể khỏe mạnh.");
          }
          if (exercise.includes("Yoga")) {
              addAdvice(false, "Yoga rất tốt để giảm căng thẳng và tăng dẻo dai.");
          }
          if (exercise.includes("Gym")) {
              addAdvice(false, "Hãy kết hợp tập luyện với dinh dưỡng hợp lý.");
          }
          if (exercise.includes("Aerobic & nhảy múa")) {
              addAdvice(false, "Hoạt động này giúp đốt cháy năng lượng và cải thiện tâm trạng.");
          }
          if (exercise.includes("Bơi lội")) {
              addAdvice(false, "Bơi lội giúp tăng cường toàn bộ cơ thể và rất tốt cho tim mạch.");
          }
          if (exercise.includes("Thể thao đồng đội")) {
              addAdvice(false, "Thể thao đồng đội không chỉ tốt cho sức khỏe mà còn giúp gắn kết xã hội.");
          }
          if (exercise.includes("Chạy")) {
              addAdvice(false, "Chạy bộ giúp tăng sức bền và giải phóng endorphin, cải thiện tâm trạng.");
          }
          if (exercise.includes("Đạp xe đạp")) {
              addAdvice(false, "Đạp xe là lựa chọn tuyệt vời cho hệ tim mạch và sức khỏe tổng thể.");
          }
          if (exercise.includes("Đi bộ")) {
              addAdvice(false, "Đi bộ mỗi ngày giúp cải thiện tuần hoàn máu.");
          }

          // 🎯 Hoạt động tình dục và nhu cầu tình dục
          if (sexual.includes("Không quan hệ tình dục")) {
              addAdvice(false, "Không quan hệ tình dục cũng là một lựa chọn lành mạnh, quan trọng là bạn cảm thấy thoải mái với quyết định của mình.");
          }
          if (sexual.includes("Thủ dâm")) {
              addAdvice(false, "Thủ dâm ở mức độ vừa phải lành mạnh và giúp giảm căng thẳng.");
          }
          if (sexual.includes("Quan hệ tình dục có bảo vệ")) {
              addAdvice(false, "Sử dụng biện pháp bảo vệ giúp ngăn ngừa mang thai ngoài ý muốn và bệnh lây qua đường tình dục.");
          }
          if (sexual.includes("Quan hệ tình dục không bảo vệ")) {
              addAdvice(true, "Hãy lưu ý nguy cơ mang thai ngoài ý muốn và bệnh lây qua đường tình dục.");
          }
          if (sexual.includes("Quan hệ tình dục bằng miệng")) {
              addAdvice(true, "Quan hệ bằng miệng vẫn có nguy cơ lây bệnh, hãy cân nhắc biện pháp an toàn.");
          }
          if (sexual.includes("Quan hệ tình dục qua đường hậu môn")) {
              addAdvice(true, "Quan hệ qua đường hậu môn có nguy cơ tổn thương và lây bệnh cao, hãy sử dụng biện pháp bảo vệ.");
          }
          if (sexual.includes("Cực khoái")) {
              addAdvice(false, "Cực khoái mang lại nhiều lợi ích cho tinh thần và thể chất, hãy tận hưởng một cách lành mạnh.");
          }
          if (sexual.includes("Nhu cầu tình dục cao")) {
              addAdvice(false, "Đây có thể là dấu hiệu rụng trứng, hoàn toàn bình thường.");
          }
          if (sexual.includes("Nhu cầu tình dục bình thường")) {
              addAdvice(false, "Nhu cầu tình dục ổn định, đây là dấu hiệu tốt cho sức khỏe sinh lý.");
          }
          if (sexual.includes("Nhu cầu tình dục thấp")) {
              addAdvice(true, "Có thể do mệt mỏi hoặc stress, hãy nghỉ ngơi thêm và chăm sóc bản thân.");
          }

          // 🎯 Tiết dịch âm đạo
          vaginalDischargeData.forEach(v => {
              if (v === "Trắng đục" || v === "Như lòng trắng trứng" || v === "Ẩm ướt" || v === "Dạng dính") {
                  addAdvice(false, "Tiết dịch âm đạo này được xem là bình thường. Đây có thể là dấu hiệu của rụng trứng hoặc chu kỳ kinh nguyệt sắp tới.");
              }
              if (v === "Trắng vón cục" || v === "Xám" || v === "Bất thường" || v === "Dạng đốm") {
                  addAdvice(true, "Tiết dịch âm đạo có dấu hiệu bất thường. Bạn nên đi khám phụ khoa để được tư vấn và điều trị kịp thời.");
              }
              if (v === "Không có dịch") {
                  addAdvice(false, "Không có dịch âm đạo cũng có thể bình thường, đặc biệt trong một số giai đoạn của chu kỳ.");
              }
          });

          // 🎯 Dấu hiệu rụng trứng
          ovulationSigns.forEach(o => {
              if (o.includes("Tăng ham muốn tình dục")) addAdvice(true, "Đây là dấu hiệu bình thường trong rụng trứng.");
              if (o.includes("Đau bụng dưới và vùng chậu")) addAdvice(true, "Theo dõi nếu đau kéo dài hoặc dữ dội.");
              if (o.includes("Thay đổi nhiệt độ cơ sở")) addAdvice(true, "Hãy tiếp tục theo dõi nhiệt độ cơ thể hàng ngày để xác định chính xác thời điểm rụng trứng.");
              if (o.includes("Dịch nhầy âm đạo")) addAdvice(true, "Dịch nhầy trong, giống lòng trắng trứng là dấu hiệu rụng trứng bình thường. Hãy theo dõi sự thay đổi của nó.");
              if (o.includes("Xuất hiện đốm máu")) addAdvice(true, "Đốm máu có thể xuất hiện do rụng trứng, thường là một lượng nhỏ và không kéo dài.");
              if (o.includes("Sưng đầu ngực, đau vú")) addAdvice(true, "Các triệu chứng này có thể liên quan đến sự thay đổi hormone trong chu kỳ.");
              if (o.includes("Cổ tử cung mở rộng")) addAdvice(true, "Khi rụng trứng, cổ tử cung sẽ mềm, mở và cao hơn. Đây là một dấu hiệu tốt.");
              if (o.includes("Âm đạo hoặc âm hộ bị sưng")) addAdvice(true, "Sự thay đổi hormone có thể gây sưng nhẹ. Nếu cảm thấy khó chịu, bạn nên tham khảo ý kiến bác sĩ.");
              if (o.includes("Đầy bụng")) addAdvice(true, "Hãy ăn các thực phẩm dễ tiêu và tránh đồ ăn có nhiều gia vị để giảm khó chịu.");
              if (o.includes("Đầy hơi")) addAdvice(true, "Hãy ăn các thực phẩm dễ tiêu và tránh đồ ăn có nhiều gia vị để giảm khó chịu.");
              if (o.includes("Nhức đầu")) addAdvice(true, "Các triệu chứng này có thể liên quan đến rụng trứng hoặc các yếu tố khác. Hãy nghỉ ngơi và uống đủ nước.");
              if (o.includes("Buồn nôn")) addAdvice(true, "Các triệu chứng này có thể liên quan đến rụng trứng hoặc các yếu tố khác. Hãy nghỉ ngơi và uống đủ nước.");
          });

          // 🎯 Cân nặng
          if (rowData['Cân nặng (kg)']) {
              const weight = parseFloat(rowData['Cân nặng (kg)']);
              if (weight < 45) addAdvice(true, "Cân nặng hơi thấp, chú ý bổ sung dinh dưỡng.");
              if (weight > 70) addAdvice(true, "Bạn nên tập luyện và ăn uống điều độ để giữ cân nặng hợp lý.");
          }

          // 🎯 Thuốc
          if (rowData['Thuốc ngoài']) addAdvice(true, `Bạn đang dùng thuốc: ${rowData['Thuốc ngoài']}. Hãy tuân thủ đúng hướng dẫn.`);
          if (rowData['Thuốc tránh thai đường uống (OC)'] === "Đã uống bù/ quên thuốc") addAdvice(true, "Hãy chú ý uống thuốc đúng giờ để đảm bảo hiệu quả tránh thai.");

          // Nếu không có gì nổi bật
          if (!advice) advice = "Không có vấn đề nổi bật nào hôm nay. Hãy tiếp tục duy trì lối sống lành mạnh nhé!";
          return advice;
      }